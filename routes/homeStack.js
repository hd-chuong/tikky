import {createStackNavigator} from 'react-navigation-stack';
import Home from '../screen/home';
import Review from '../screen/review';
import Header from '../shared/header';
import React from 'react';
const screens = {
    Home: {
        screen: Home,
        navigationOptions: ({navigation}) => {
            return {
                headerTitle: () => <Header 
                                navigation={navigation}
                                title='stikky'
                                />,
            }    
        }
    },

    Review: {
        screen: Review,
        navigationOptions: {
            title: "Review Details"
        }
    }
}

const HomeStack = createStackNavigator(screens, {
    defaultNavigationOptions: {
        headerStyle: {backgroundColor: "coral",
        height: 60,
        headerTintColor: '#444',
    }
    }
});

export default HomeStack;