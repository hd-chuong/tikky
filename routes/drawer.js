import {createDrawerNavigator} from 'react-navigation-drawer';
import {createAppContainer} from 'react-navigation';
import HomeStack from './homeStack';
import AboutStack from './aboutStack';
import ArchiveStack from './archiveStack';
const RootDrawerNavigator = createDrawerNavigator({
    Home: {
        screen: HomeStack,
    },
    
    About: {
        screen: AboutStack,
    },
    Archive: {
        screen: ArchiveStack,
    }
});

export default createAppContainer(RootDrawerNavigator);