import React, {useState, useEffect, Component} from 'react';

import {StyleSheet, 
        View, 
        Text, 
        FlatList, 
        TouchableOpacity, 
        ImageBackground,
        TouchableWithoutFeedback,
        Keyboard,
        AsyncStorage,
        Alert,
    } from 'react-native';
import {globalStyles} from '../styles/global';
import Card from '../components/card';
import {MaterialIcons} from '@expo/vector-icons';
import update from 'react-addons-update';

class Archive extends Component {
    constructor(props) {
        super(props);

        this.remove = this.remove.bind(this);
        this.load = this.load.bind(this);
        this.alertRemove = this.alertRemove.bind(this);
        this.updateReviews = this.updateReviews.bind(this);
        this.navigation = props.navigation;
        
        this.state = {
            archives: [],
            modalOpen: false,
        }
        this.load();
    }
    render() {
        let emptyMessage = null;
        if (this.state.archives.length == 0)
        {
            emptyMessage = <Text>There is no stickie left.</Text>
        }

        return (
            <ImageBackground source={require('../assets/archive_bg.png')}style={globalStyles.container}>
                <View style={styles.toolPanel}>
                    <MaterialIcons
                        name='delete'
                        size={24}
                        style={styles.modalToggle}
                        onPress={this.alertRemove}
                    />
                </View>
                
                {emptyMessage}
                
                <FlatList
                    data={this.state.archives}
                    renderItem={({item}) => {
                        return (
                            <TouchableOpacity onPress={()=> this.navigation.navigate('Review', {...item, updateReview: this.updateReviews})}>
                                <Card>
                                    <Text style={globalStyles.titleText}>{item.title}<MaterialIcons name='archive' size={18}></MaterialIcons></Text>
                                </Card>
                            </TouchableOpacity>
                        )
                    }}
                />
            </ImageBackground>
        )
    }
}

export default Archive;

const styles = StyleSheet.create({
    modalToggle: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#f2f2f2',
        padding: 10,
        borderRadius: 10,
        alignSelf: 'center',
    },
    modelClose: {
        marginTop: 20,
        marginBottom: 0,   
    },

    modalContent: {
        flex: 1,
    },

    toolPanel: {
        flexDirection: 'row-reverse',
    }
});
