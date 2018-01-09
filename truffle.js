module.exports = {
  networks: {
    // Here we define where the contract will be deployed to
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    }
  }
};