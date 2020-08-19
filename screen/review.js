import React, {useState} from 'react';
import {StyleSheet, View, Text, Button, FlatList, CheckBox} from 'react-native';
import {globalStyles, images} from '../styles/global';
import { TextInput } from 'react-native-gesture-handler';
import update from 'react-addons-update';

import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase("db.db");

function displayTime(date)
{
    if (date == null)
    {
        return "unknown";
    }
    var now = Date.now();
    var tickDiff = Number(now) - Number(date);
    
    if (tickDiff < 1000 * 60)
    {
        return "a few seconds ago.";
    }

    else if (tickDiff < 1000 * 60 * 60)
    {
        return "" + Math.floor(tickDiff / 1000 / 60) + " mins ago.";
    }
    else if (tickDiff < 1000 * 60 * 60 * 24)
    {
        return "" + Math.floor(tickDiff / 1000 / 60 / 60) + " hours ago.";
    }
    else 
    {
        // bug here
        const formatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
        return "on " + formatter.format(date);
    }
}

export default class Review extends React.Component {
    constructor(props)
    {
        super(props);
        this.navigation = props.navigation;

        this.pressHandler = this.pressHandler.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
        this.load = this.load.bind(this);
        this.updateItem = this.updateItem.bind(this);

        this.state = {
            item: this.navigation.getParam('item'),
            checklist: [],
            newCheckbox: {hasDone: 0, content: ""}
        }
        this.load();

    }
    async updateItem(id, newData)
    {
        var targetIndex = -1;
        for (let i = 0; i < this.state.checklist.length; ++i)
        {
            let todoItem = this.state.checklist[i];
            if (todoItem.id == id)
            {
                targetIndex = i;
            }
        }

        if (targetIndex != -1)
        {
            newData.hasDone = (newData.hasDone === 0) ? 1: 0;
            this.setState(update(this.state, {
                checklist: {
                    [targetIndex]: {
                        $set: newData
                    }
                }
            }));

            db.transaction(
                (tx) => {
                    tx.executeSql("UPDATE checklist SET hasDone = ? WHERE id = ?;", 
                    [newData.hasDone, id]);
                    }, () => {console.log("fail modifying list"), () => {console.log("success")}}
            );
        }
    }

    async load()   
    {
        db.transaction(tx => {
            tx.executeSql(
                "create table if not exists checklist (id integer PRIMARY KEY not null, content text, createdTime int, hasDone int, review_id INT, FOREIGN KEY (review_id) REFERENCES reviews (id));"
            );

            tx.executeSql("select * from checklist where review_id = ?", [this.state.item.id], (_, { rows: { _array, length } }) => {
                this.setState({checklist: _array != null ? _array: []});
            });
        }, () => {console.log("Fail loading to do items")}, ()=> {console.log("Seems like successing in loading items")});
    }

    pressHandler()
    {
        var updateReview = this.navigation.getParam('updateReview');
        updateReview(this.state.item.id, this.state.item);
        this.navigation.goBack();
    }
    
    addNewItem()
    {
        let newCheckbox = {...this.state.newCheckbox, id: Date.now()};
        this.setState({checklist: [...this.state.checklist, newCheckbox] });

        db.transaction(tx => {
            tx.executeSql(
                "insert into checklist (id, content, createdTime, hasDone, review_id) values (?, ?, ?, ?, ?);",
                [newCheckbox.id, newCheckbox.content, newCheckbox.id, newCheckbox.hasDone, this.state.item.id]
            );
        }, () => {console.log("Fail add new todo")}, () => {console.log("Seems like succeeding adding new todo")}  );
    }

    render() 
    {
        return (
            <View style={globalStyles.container}>
                    <View style={styles.titleLine}>
                        {/* Title */}
                        <TextInput 
                            multiline
                            style={globalStyles.titleText} 
                            defaultValue={this.state.item.title}
                            onChangeText={(newTitle) => {this.setState({item: {...this.state.item, title: newTitle}})}}    
                        />
                        <Text>Created {displayTime(new Date(this.state.item.createdTime))}</Text>
                    </View>
                        
                        {/* Description */}
                        <TextInput 
                            multiline 
                            defaultValue={this.state.item.body} 
                            onChangeText={(newBody) => {this.setState({item: {...this.state.item, body: newBody}})} } 
                        />

                    <View>
                        <FlatList
                            data={this.state.checklist}
                            renderItem={({item, i}) => {
                                return (<View style={styles.checkboxLine}>
                                            <CheckBox
                                                value={item.hasDone === 1}
                                                onValueChange={() => {
                                                    this.updateItem(item.id, item);
                                                }}/><Text>{item.content}</Text>
                                        </View>
                                )
                            }}
                        />
                        <View style={styles.checkboxLine}>
                            <CheckBox 
                                value={this.state.newCheckbox.hasDone === 1} 
                                onValueChange={() => 
                                        this.setState({newCheckbox: {
                                                    hasDone: this.state.newCheckbox.hasDone === 0 ? 1: 0, 
                                                    content: this.state.newCheckbox.content
                                                }})
                                }/>
                            <TextInput 
                                placeholder={"Enter an item here"} 
                                defaultValue={this.state.newCheckbox.content}
                                onChangeText={(content) => this.setState({newCheckbox: {hasDone: this.state.newCheckbox.hasDone, content}})}
                                onSubmitEditing={()=> {this.addNewItem(); this.setState({newCheckbox: {hasDone: false, content: ""}})}}
                            />
                        </View>

                        <Button title='Update' onPress={this.pressHandler}/>
                    </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    checkboxLine: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleLine: {
        flexDirection: 'row',
        alignItems: 'center',

    }
})