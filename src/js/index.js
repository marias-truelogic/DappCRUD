import React from "react";
import ReactDOM from "react-dom";
import Web3 from 'web3';
import TruffleContract from 'truffle-contract';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';

// This is information about our deployed contract, the address and it's interface
import UserCrudABI from '../../build/contracts/UserCrud.json';

import UserTable from './components/UserTable';
import UserForm from './components/UserForm';

class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            web3: false,
            contract: false,
            accounts: [],
            users: [],
        }

        this.syncUsers = this.syncUsers.bind(this);
        this.retrieveAccounts = this.retrieveAccounts.bind(this);
        this.setUpConnection = this.setUpConnection.bind(this);
    }

    componentWillMount() {
        this.setUpConnection();
    }

    async setUpConnection() {
        const provider = new Web3.providers.HttpProvider(process.env.REACT_APP_RCP_PROVIDER);
        const web3 = new Web3(provider);
        const self = this;

        // Loads the contract definition from the deployed json
        const UserCrudContract = TruffleContract(UserCrudABI);
        UserCrudContract.setProvider(provider);

        //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
        if (typeof UserCrudContract.currentProvider.sendAsync !== "function") {
            UserCrudContract.currentProvider.sendAsync = function () {
                return UserCrudContract.currentProvider.send.apply(
                    UserCrudContract.currentProvider,
                    arguments
                );
            };
        }

        // Check for deployed contract
        const contract = await UserCrudContract.deployed();

        this.setState({ contract, web3 }, () => {
            self.retrieveAccounts();
            self.syncUsers();
        });
    }

    async syncUsers() {
        const { contract, web3 } = this.state;

        // Get user count (cheap)
        const userCount = await contract.getUsercount();

        if (userCount.toNumber() > 0) { //All numbers from our contracts are "BigNumbers"
            const numOfUsers = userCount.toNumber();
            const users = [];

            for (let i = 0; i < numOfUsers; i++) {
                const userAddress = await contract.getUserByIndex(i);
                const userInfo = await contract.getUser(userAddress);
                users.push({
                    address: userAddress,
                    email: web3.utils.toAscii(userInfo[0]),
                    age: userInfo[1].toNumber()
                })
            }

            this.setState({ users });
        }
    }

    retrieveAccounts() {
        const { web3 } = this.state;
        web3.eth.getAccounts((error, data) => {
            this.setState({ accounts: data });
        })
    }

    render() {
        const { users, contract, accounts, web3 } = this.state;

        return (
            <div className="container-fluid">
                <div className='row'>
                    <div className="col">
                        <UserTable
                            users={users}
                            syncUsers={this.syncUsers}
                            contract={contract}
                            web3={web3}
                        />
                    </div>
                </div>
                <div className='row'>
                    <div className="col">
                        <hr />
                    </div>
                </div>
                <div className='row'>
                    <div className="col">
                        <UserForm
                            syncUsers={this.syncUsers}
                            contract={contract}
                            web3={web3}
                        />
                    </div>
                </div>
                {accounts.length ? (
                    <div className='row justify-content-center'>
                        <div className="col">
                            <hr/>
                            <h4>Test accounts</h4>
                            <ul>
                                {accounts.map((account, index) => <li key={index}>{account}</li>)}
                            </ul>
                        </div>
                    </div>
                ) : ''}
                
            </div>
        );
    }
}

var mountNode = document.getElementById("app");
ReactDOM.render(< Main />, mountNode);
