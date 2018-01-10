A simple CRUD application. 

Since we don't have an indexed database, we will have to handle this ourselves.
Solidity has `mappings`, which gives us quick look ups. The downside is that they do not provide a way to find out which items were saved, or how many.
We will use a dynamic array to store the keys(`addresses`) which have been inserted. This way we know which and how many items we have.

For deleting, we will replace and move keys instead of rewriting the array. This saves us some gas.

Dependencies:

- 

