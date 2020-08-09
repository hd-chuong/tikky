import {createStackNavigator} from 'react-navigation-stack';
import Archive from '../screen/archive';
import Review from '../screen/review';
import Header from '../shared/header';
import React from 'react';

const screens = {
    Archive: {
        screen: Archive,
        navigationOptions: ({navigation}) => {
            return {
                headerTitle: () => <Header 
                                navigation={navigation}
                                title='Archive'
                                />,
            }    
        }
    }
}

const ArchiveStack = createStackNavigator(screens, {
    defaultNavigationOptions: {
        headerStyle: {backgroundColor: "green",
        height: 60,
        headerTintColor: '#444',
    }
    }
});

export default ArchiveStack;