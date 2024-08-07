// https://eth-sepolia.g.alchemy.com/v2/MgfCi0Kh3KnXtm6-pmg1qAEEgNHJpYRp

require('@nomicfoundation/hardhat-toolbox');

module.exports = {
    solidity: '0.8.19',
    networks: {
        sepolia: {
            url: 'https://eth-sepolia.g.alchemy.com/v2/MgfCi0Kh3KnXtm6-pmg1qAEEgNHJpYRp',
            accounts: [
                'cc78de6ca671bb2a13309e8016aadee7aaa3b7f5e6707d84ec95b47053987c9e',
            ],
        },
    },
};
