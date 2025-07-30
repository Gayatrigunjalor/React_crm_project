import React, { createContext, useContext, useState } from 'react';

const OpportunityContext = createContext();

export const OpportunityProvider = ({ children }) => {
    const [opportunityData, setOpportunityData] = useState({
        buying_plan: "",
        name: "",
        mo_no: "",
        email: "",
    });
    const [refreshProductPriceData, setRefreshProductPriceData] = useState(false);
    const [shouldRefreshOpportunity, setShouldRefreshOpportunity] = useState(false);

    const updateOpportunityData = (newData) => {
        setOpportunityData(prevData => ({
            ...prevData,
            ...newData
        }));
    };

    const triggerProductPriceRefresh = () => {
        setRefreshProductPriceData(prev => !prev);
    };

    const triggerOpportunityRefresh = () => {
        setShouldRefreshOpportunity(prev => !prev); // ✅ Toggling the value
    };


    return (
        <OpportunityContext.Provider value={{
            opportunityData,
            updateOpportunityData,
            refreshProductPriceData,
            triggerProductPriceRefresh,
            shouldRefreshOpportunity,
            triggerOpportunityRefresh
        }}>
            {children}
        </OpportunityContext.Provider>
    );
};

export const useOpportunity = () => {
    const context = useContext(OpportunityContext);
    if (!context) {
        throw new Error('useOpportunity must be used within an OpportunityProvider');
    }
    return context;
}; 