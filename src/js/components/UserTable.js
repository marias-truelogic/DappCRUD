import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';

export default class CandidateTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            users: this.props.users,
            contract: this.props.contract,
            web3: this.props.web3,
            modalOpen: false,
            modalData: {
                age: '',
                address: '',
                email: ''
            }
        }
        this.editUser = this.editUser.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.buildUsersTable = this.buildUsersTable.bind(this);
        this.showSuccess = this.showSuccess.bind(this);
        this.showError = this.showError.bind(this);
        this.onUpdateChange = this.onUpdateChange.bind(this);
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

    editUser(user) {
        this.setState({ modalOpen: true, modalData: user });
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

    async updateUser() {
        const { modalData, contract } = this.state;

        if (!modalData.address || !modalData.email || !modalData.age) return false; // Show error here

        try {
            const contractRes = await contract.updateUser(modalData.address, modalData.email, modalData.age, { from: process.env.REACT_APP_TEST_ADDRESS, gas: 150000 });
            this.showSuccess(`User ${modalData.address} updated`);
        } catch (e) {
            this.showError(e.message);
        }

        this.closeModal();
        this.props.syncUsers();
    }

    onUpdateChange(event) {
        this.setState({
            modalData: {
                ...this.state.modalData,
                [event.target.name]: event.target.value
            }
        });
    }

    closeModal() {
        this.setState({ modalOpen: false });
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
                                    <td style={{"textAlign": "right"}}>
                                        <a href="#" style={{"marginRight": "15px"}} className="btn btn-primary btn-info" onClick={() => { this.editUser(user) }}><span className="fa fa-pencil"></span> Edit</a>
                                        <a href="#" className="btn btn-primary btn-danger" onClick={() => { this.deleteUser(user.address) }}><span className="fa fa-trash"></span> Delete</a>
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
        const { users, modalData } = this.state;
        return (
            <div className='userTableContainer'>
                <h3>Users</h3>
                {users.length ? this.buildUsersTable() : <b>No Users</b>}
                <Modal isOpen={this.state.modalOpen} >
                    <ModalHeader>Update User</ModalHeader>
                    <ModalBody>
                        <form onSubmit={this.updateUser}>
                            <div className="form-group">
                                <label htmlFor="accountAddressInput">Account Address</label>
                                <input disabled type="text" value={modalData.address} className="form-control" id="accountAddressInput" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="emailInput">Email</label>
                                <input onChange={this.onUpdateChange} type="email" name="email" value={modalData.email} className="form-control" id="emailInput" placeholder="Enter Email" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ageInput">Age</label>
                                <input onChange={this.onUpdateChange} type="text" name="age" value={modalData.age} className="form-control" id="ageInput" placeholder="Enter Age" />
                            </div>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.updateUser}>Submit</Button>{' '}
                        <Button color="secondary" onClick={this.closeModal}>Cancel</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}