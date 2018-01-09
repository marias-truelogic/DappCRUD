pragma solidity ^0.4.17;

contract UserCrud {

    struct UserStruct {
        bytes32 email;
        uint age;
        uint index;
    }

    // A mapping is a fast key:value structure, it preempitively assigns the whole allowed space with the type.
    // ie. You can't push to it, but you will always be able to assign a value with (in this case) the address as the index
    mapping (address => UserStruct) private userStructs;

    // Here we'll store all user indexes that are in the "db"
    // private in case we have child constract, prevent modification
    address[] private userIndex;

    // TODO: Figure out how events work :/
    event LogNewUser   (address indexed userAddress, uint index, bytes32 userEmail, uint userAge);
    event LogUpdateUser(address indexed userAddress, uint index, bytes32 userEmail, uint userAge);
    event LogDeleteUser(address indexed userAddress, uint index);

    // INSERT
    function insertUser(address userAddress, bytes32 userEmail, uint userAge) public returns (uint index) {
        require(isUser(userAddress)); // Validate user before insert

        userStructs[userAddress].email = userEmail;
        userStructs[userAddress].age = userAge;

        // Set a pointer to the new userIndex item (push returns the new address length, use this minus 1 to get a pointer; saves on gas)
        userStructs[userAddress].index = userIndex.push(userAddress) - 1;

        // How do events work? tbd
        LogNewUser(userAddress, userStructs[userAddress].index, userEmail, userAge);

        return userIndex.length - 1;
    }

    // UPDATE
    function updateUser(address userAddress, bytes32 userEmail, uint userAge) public returns (bool success) {
        require(isUser(userAddress)); // Validate user before insert

        userStructs[userAddress].email = userEmail;
        userStructs[userAddress].age = userAge;

        LogUpdateUser(userAddress, userStructs[userAddress].index, userEmail, userAge);

        return true;
    }

    // GET
    function getUser(address userAddress) public view returns(bytes32 email, uint age) {
        require(isUser(userAddress)); // Validate user before insert
        return (
            userStructs[userAddress].email,
            userStructs[userAddress].age
        );
    }

    // GET COUNT
    function getUsercount() public view returns(uint count) {
        return userIndex.length;
    }

    // GET BY INDEX
    function getUserByIndex(uint index) public view returns(address userAddress) {
        return userIndex[index];
    }

    // DELETE user
    // Deleting can be expensive. Here instead of rewriting the userIndex array, we move the last item into the position 
    // where the deleted item is. Then update struct indexes.
    function deleteUser(address userAddress) public returns (uint index) {
        require(isUser(userAddress)); // Validate user before delete

        uint rowToDelete = userStructs[userAddress].index; // This is what we're deleting
        address keyToMove = userIndex[userIndex.length - 1]; // This is the last item in the userInde array. We'll use it to overwrite the row we're deleting

        userIndex[rowToDelete] = keyToMove; // Overwrite row with the last userIndex item
        userStructs[keyToMove].index = rowToDelete; // Update the index of the userstruct that was moved(last one) to the overwriten key
        userIndex.length--; // Removed the last item in the userIndex (the one moved), since it's not in the overwrite location

        LogDeleteUser(userAddress, rowToDelete); // Notify of our deleted user
        LogUpdateUser(keyToMove, rowToDelete, userStructs[keyToMove].email, userStructs[keyToMove].age); // Notify of the index update

        return rowToDelete; //return the row we deleted
    }

    // Validation
    function isUser(address userAddress) public view returns (bool success) {
        // If there are no users in the userIndex, the address is not a saved user
        if (userIndex.length == 0) {
            return false;
        }
        // check the index of the user struct vs the user index in the userindex array
        // (remember, all addresses are present in the user structs. The default value for the index is 0)
        return (userIndex[userStructs[userAddress].index] == userAddress);
    }

}