import React from "react";
import { ToastContainer, toast } from 'react-toastify';

export default class CandidateTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contract: this.props.contract,
            web3: this.props.web3,
            formFields: {
                address: '',
                email: '',
                age: ''
            }
        }
        this.showSuccess = this.showSuccess.bind(this);
        this.showError = this.showError.bind(this);
        this.onChange = this.onChange.bind(this);
        this.createNewUser = this.createNewUser.bind(this);
    }

    componentWillReceiveProps(newProps) {
        if (newProps !== this.props) {
            this.setState({ contract: newProps.contract, web3: newProps.web3 });
        }
    }

    onChange(event) {
        this.setState({
            formFields: {
                ...this.state.formFields,
                [event.target.name]: event.target.value
            }
        });
    }

    showSuccess(message) {
        toast.success(message, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    showError(message) {
        toast.error(message, {
            position: toast.POSITION.BOTTOM_RIGHT
        });
    }

    async createNewUser(e) {
        e.preventDefault();
        const { address, email, age } = this.state.formFields;
        const { contract, web3 } = this.state;
        const self = this;

        if (!email || !address || !age) return false;

        // const hexEmail = web3.utils.toHex(email);
        // IMPORTANT: FROM address is required, since this address will be paying for the gas. 
        // Every action that involves writing has a gas cost
        // Need more gas than the default
        try {
            const contractRes = await contract.insertUser(address, email, age, { from: process.env.REACT_APP_TEST_ADDRESS, gas: 150000 });
            this.showSuccess(`User ${address} created`);
        } catch(e) {
            this.showError(e.message);
        }

        this.setState({
            formFields: {
                address: '',
                email: '',
                age: ''
            }
        }, () => self.props.syncUsers());
    }

    render() {
        const { users, formFields } = this.state;
        return (
            <div className='userFormContainer'>
                <h3>New User</h3>
                <form onSubmit={this.createNewUser}>
                    <div className="form-group">
                        <label htmlFor="accountAddressInput">Account Address</label>
                        <input onChange={this.onChange} type="text" name="address" value={formFields.address} className="form-control" id="accountAddressInput" placeholder="Enter Account Address" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="emailInput">Email</label>
                        <input onChange={this.onChange} type="email" name="email" value={formFields.email} className="form-control" id="emailInput" placeholder="Enter Email" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="ageInput">Age</label>
                        <input onChange={this.onChange} type="text" name="age" value={formFields.age} className="form-control" id="ageInput" placeholder="Enter Age" />
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
                <ToastContainer />
            </div>
        );
    }
}