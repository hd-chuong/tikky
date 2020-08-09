import React, {useState, useEffect, Component} from 'react';

import {StyleSheet, 
        View, 
        Text, 
        FlatList, 
        TouchableOpacity, 
        ImageBackground,
        Modal,
        TouchableWithoutFeedback,
        Keyboard,
        AsyncStorage,
        Alert,
    } from 'react-native';
import {globalStyles} from '../styles/global';
import Card from '../components/card';
import {MaterialIcons} from '@expo/vector-icons';
import ReviewForm from './reviewForm'
import update from 'react-addons-update';
import Constants from 'expo-constants';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase("db.db");

class Home extends Component {
    constructor(props) {
        super(props);

        // binding list
        this.save = this.save.bind(this);
        this.deleteAll = this.deleteAll.bind(this);
        this.addReview = this.addReview.bind(this);
        this.load = this.load.bind(this);
        this.archive = this.archive.bind(this);
        this.alertRemove = this.alertRemove.bind(this);
        this.updateReviews = this.updateReviews.bind(this);
                
        this.navigation = props.navigation;
        
        this.state = {
            reviews: [],
            modalOpen: false,
        }

        this.load();
    }

    updateReviews(key, newData)
    {
        var targetIndex = -1;
        for (let i = 0; i < this.state.reviews.length; ++i)
        {
            let review = this.state.reviews[i];
            if (review.key == key)
            {
                targetIndex = i;
            }
        }

        if (targetIndex != -1)
        {
            this.setState(update(this.state, {
                reviews: {
                    [targetIndex]: {
                        $set: newData
                    }
                }
            }))

        }
    }

    async load()    
    {
        db.transaction(tx => {
            tx.executeSql(
                "create table if not exists reviews (id integer primary key not null, title text, body text, createdTime int, isArchive bool);"
            );

            tx.executeSql("select * from reviews", [], (_, { rows: { _array, length } }) => {
                console.log('query all databases',JSON.stringify(_array))
                this.setState({reviews: _array != null ? _array: []});
            }
            );
        }, 
        null);

        // try {
        //     let loadedReviews = await AsyncStorage.getItem("reviews");  
        //     this.setState({reviews: loadedReviews != null ? JSON.parse(loadedReviews) : []});
        // }
        // catch (err) {
        //     alert(err);
        // }
    }

    async save()
    {
        try {
            await AsyncStorage.setItem("reviews", JSON.stringify(this.state.reviews));        
        }
        catch (err) {
            alert(err);
        }
    }

    async deleteAll()
    {
        try {
            await AsyncStorage.removeItem('reviews');
        }
        catch (err) {
            alert(err)
        }
        finally {
            this.setState({reviews: []});
        }
    }

    async alertRemove() {
        Alert.alert("Dangerous", "Do you want to delete all items?",
        
        [{text: "Yes", onPress: () => this.deleteAll()},
         {text: "No", onPress: () => {console.log("cancel")}}],
         {cancelable: true}
        )
    }

    async addReview(review) {
        review.key = Date.now();
        review.createdTime = Date.now();
        db.transaction(
            (tx) => {
                tx.executeSql("insert into reviews (title, body, createdTime) values ( ?, ?, ?)", 
                [review.title, review.body, review.createdTime]);

                tx.executeSql("select * from reviews", [], (_, { rows: { _array, length } }) => {

                    console.log('query after adding',JSON.stringify(_array));
                    console.log('the length of the arrays ', length);
                });
                
            }, () => {console.log("fail"), () => {console.log("success")}});

        try {
            this.setState( {reviews: [review,...this.state.reviews] });
            
        } catch(err) {
            alert(err);
        }
        finally {
            this.setState({modalOpen:false});
        }    
        this.save();
    }

    async archive(item) {
        
        try {
            // loaded item
            let loadedArchives = await AsyncStorage.getItem("archives"); 
            loadedArchives = JSON.stringify(loadedArchives);
            console.log(loadedArchives);    
            
            //save item to archives
            let newArchives = [item, ...loadedArchives];
            
            
            await AsyncStorage.setItem("archives", JSON.stringify(newArchives));
            
            //delete item from archives
            let targetIndex = -1;
            for (let i = 0; i < this.state.reviews.length; ++i)
            {
                if (item.key == this.state.reviews[i].key)
                {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex != -1)
            {
                let newReviews = this.state.reviews;
                newReviews.splice(targetIndex, 1);
                this.setState({reviews: newReviews});
            }
        }
        catch (err) 
        {
            alert(err);
        }
    }
    
    render() {
        let emptyMessage = null;
        if (this.state.reviews.length == 0)
        {
            emptyMessage = <Text>There is no stickie left.</Text>
        }

        return (
            <ImageBackground source={require('../assets/game_bg.png')}style={globalStyles.container}>
                <Modal visible={this.state.modalOpen} animationType='slide' style={styles.modalContent}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContent}>
                        <MaterialIcons
                            name='close'
                            size={24}
                            style={{...styles.modalToggle, ...styles.modalClose}}
                            onPress={() => {this.setState({modalOpen:false})}}
                        />

                        <ReviewForm addReview={this.addReview}/>
                    </View>
                    </TouchableWithoutFeedback>
                </Modal>
                <View style={styles.toolPanel}>
                
                <MaterialIcons
                    name='add'
                    size={24}
                    style={styles.modalToggle}
                    onPress={() => {
                        this.setState({modalOpen:true})
                    }}
                />

                <MaterialIcons
                    name='delete'
                    size={24}
                    style={styles.modalToggle}
                    onPress={this.alertRemove}
                />
                
                <MaterialIcons
                    name='save'
                    size={24}
                    style={styles.modalToggle}
                    onPress={this.save}
                />
                </View>
                
                {emptyMessage}
                
                <FlatList
                    data={this.state.reviews}
                    renderItem={({item}) => {
                        return (
                            <TouchableOpacity onPress={()=> this.navigation.navigate('Review', {...item, updateReview: this.updateReviews})}>
                                <Card>
                                    <Text style={globalStyles.titleText}>{item.title}
                                    <MaterialIcons name='archive' size={18} onPress={() => {this.archive(item)}}></MaterialIcons></Text>
                                </Card>
                            </TouchableOpacity>
                        )
                    }}
                />
            </ImageBackground>
        )
    }
}


export default Home;


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
})
