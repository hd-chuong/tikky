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

        // binding lists
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

        console.log("constructor again");
        this.load();

    }

    updateReviews(id, newData)
    {
        var targetIndex = -1;
        for (let i = 0; i < this.state.reviews.length; ++i)
        {
            let review = this.state.reviews[i];
            if (review.id == id)
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

        db.transaction(
            (tx) => {
                tx.executeSql("UPDATE reviews SET title = ?, body = ? WHERE id = ?;", 
                [newData.title, newData.body, id]);
                }, () => {console.log("fail"), () => {console.log("success")}}
        );

    }

    async load()    
    {
        db.transaction(tx => {
            tx.executeSql(
                "create table if not exists reviews (id integer primary key not null, title text, body text, createdTime int, isArchive int);"
            );

            tx.executeSql("select * from reviews", [], (_, { rows: { _array, length } }) => {
                this.setState({reviews: _array != null ? _array: []});
            }
            );
        }, null);
    }

    // async save()
    // {
    //     try {
    //         await AsyncStorage.setItem("reviews", JSON.stringify(this.state.reviews));        
    //     }
    //     catch (err) {
    //         alert(err);
    //     }
    // }

    async deleteAll()
    {
        // delete all the items in the table
        db.transaction(tx => {
            tx.executeSql(
                "drop table reviews;"
            );
        });
        this.setState({reviews: []});
    }

    async alertRemove() {
        Alert.alert("Dangerous", "Do you want to delete all items?",
        [{text: "Yes", onPress: () => this.deleteAll()},
         {text: "No", onPress: () => {console.log("cancel")}}],
         {cancelable: true}
        )
    }

    async addReview(review) {
        review.id = Date.now();
        review.createdTime = Date.now();
        review.isArchive = 0;

        this.setState( {reviews: [review,...this.state.reviews] });
        this.setState({modalOpen:false});
    

        db.transaction(
            (tx) => {
                tx.executeSql("insert into reviews (id, title, body, createdTime, isArchive) values (?, ?, ?, ?, 0);", 
                [review.id, review.title, review.body, review.createdTime]);
            }, () => console.log("fail add review"));
    }

    async archive(id) {
        
        db.transaction(
            (tx) => {
                tx.executeSql("UPDATE reviews SET isArchive = 1 WHERE id = ?;", [id]);
            }, () => {console.log("fail"), () => {console.log("success")}});
        
            var targetIndex = -1;
            for (let i = 0; i < this.state.reviews.length; ++i)
            {
                let review = this.state.reviews[i];
                if (review.id == id)
                {
                    targetIndex = i;
                }
            }
    
            if (targetIndex != -1)
            {
                this.setState(update(this.state, {
                    reviews: {
                        [targetIndex]: {
                            $set: {...this.state.reviews[targetIndex], isArchive : 1}
                        }
                    }
                }))
            }
    }
    
    render() {
        let emptyMessage = null;
        
        let homeReviews = this.state.reviews.filter((item) => (item.isArchive == 0));
        if (homeReviews.length == 0)
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
                </View>
                
                {emptyMessage}
                
                <FlatList
                    data={homeReviews}
                    renderItem={({item}) => {
                        return (
                            <TouchableOpacity onPress={()=> this.navigation.navigate('Review', {item, updateReview: this.updateReviews})}>
                                <Card>
                                    <Text style={globalStyles.titleText}>{item.title}
                                    <MaterialIcons name='archive' size={18} onPress={() => {this.archive(item.id)}}></MaterialIcons></Text>
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
