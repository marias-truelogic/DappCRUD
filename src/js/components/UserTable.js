import React from "react";

export default class CandidateTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: this.props.users,
            contract: this.props.contract,
            web3: this.props.web3
        }
        this.buildUsersTable = this.buildUsersTable.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if (newProps !== this.props) {
            this.setState({ users: newProps.users, contract: newProps.contract, web3: newProps.web3 });
        }
    }

    async deleteUser(userAddress) {
        const { contract, web3 } = this.state;
        if (confirm('Delete User?')) {
            const contractRes = await contract.deleteUser(userAddress, { from: process.env.REACT_APP_TEST_ADDRESS, gas: 150000 });
            this.props.syncUsers();
        }
    }

    buildUsersTable() {
        const { users } = this.state;
        return (
            <table className="table table-striped table-hover">
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Name</th>
                        <th>Age</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map((user, index) => {
                            return (
                                <tr key={index}>
                                    <td>{user.address}</td>
                                    <td>{user.email}</td>
                                    <td>{user.age}</td>
                                    <td>
                                        <button type="button" className="btn btn-danger" onClick={() => { this.deleteUser(user.address) }}>Delete</button>
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        )
    }

    render() {
        const { users } = this.state;
        return (
            <div className='userTableContainer'>
                <h3>Users</h3>
                {users.length ? this.buildUsersTable() : <b>No Users</b>}
            </div>
        );
    }
}