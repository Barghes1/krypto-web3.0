import React, {useEffect, useState} from 'react';
import { ethers } from 'ethers';

import { contractABI, contractAddress} from '../utils/constants';

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

    return transactionsContract;
}

export const TransactionProvider = ({ children }) => {

    const [currentAccount, setCurrentAccount] = useState("");
    const [formData, setFormData] = useState({ addressTo: "", amount: '', keyword: '', message: ''})
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount'));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e, name) => {
        setFormData((prevState) => ({...prevState, [name]: e.target.value}));
    }

    const getAllTransactions = async () => {
        try {
            if(!ethereum) return alert("Please install metamask!");
            const transactionContract = getEthereumContract();
            
            const availableTransactions = await transactionContract.getAllTransactions();
        
            const structuredTransactions = availableTransactions.map((t) => ({
                addressTo: t.receiver,
                addressFrom: t.sender,
                timestamp: new Date(t.timestamp.toNumber() * 1000).toLocaleString(),
                message: t.message,
                keyword: t.keyword,
                amount: parseInt(t.amount._hex) / (10 ** 18)
            }))

            console.log(structuredTransactions);

            setTransactions(structuredTransactions);
        } catch (error) {
            console.log(error);
        }
    }   

    const checkIfWalletIsConntected = async () => {

        try {
            if(!ethereum) return alert("Please install metamask!");

            const accounts = await ethereum.request({ method: 'eth_accounts'})

            if(accounts.length) {
                setCurrentAccount(accounts[0]);

                getAllTransactions();
            } else {
                console.log('No Accounts Found!')
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object!")
        }
        
    }

    const checkIfTransactionExist = async () => {
        try {
            const transactionContract = getEthereumContract();
            const transactionCount = await transactionContract.getTransactionCount();


            window.localStorage.setItem("transactionCount", transactionCount);
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object!")
        }
    }

    const connectWallet = async () => {
        try {
            if(!ethereum) return alert("Please install metamask!");
        
            const accounts = await ethereum.request({ method: 'eth_requestAccounts'})

            setCurrentAccount(accounts[0]);
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object!")
        }
    }

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert("Please install metamask!");

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount);

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [{
                    from: currentAccount,
                    to: addressTo,
                    gas: '0x5208', // 21000 GWEI
                    value: parsedAmount._hex, // 0.00001
                }]
            });

            const transactionHash = await transactionContract.addToBlockchain(addressTo, parsedAmount, message, keyword);
        
            setIsLoading(true);
            console.log(`Loading = ${transactionHash.hash}`);
            await transactionHash.wait();
            setIsLoading(false);
            console.log(`Success = ${transactionHash.hash}`);

            const transactionsCount = await transactionContract.getTransactionCount();
        
            setTransactionCount(transactionsCount.toNumber())
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object!")
        }
    }

    useEffect(() => {
        checkIfWalletIsConntected();
        checkIfTransactionExist();
    }, [])

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, sendTransaction, handleChange, transactions, isLoading }}>
            {children}
        </TransactionContext.Provider>
    )
}