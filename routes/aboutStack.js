import {createStackNavigator} from 'react-navigation-stack';
import About from '../screen/about';
import Header from '../shared/header';
import React from 'react';

const screens = {
    About: {
        screen: About,
        navigationOptions: ({navigation}) => {
            return {
                headerTitle: () => <Header 
                                    navigation={navigation}
                                    title='About'
                                    />,
            }    
        }
    },
}

const AboutStack = createStackNavigator(screens, {
    defaultNavigationOptions: {
        headerStyle: {backgroundColor: "coral",
        height: 60,
        headerTintColor: '#444',
    }
    }
});

export default AboutStack;