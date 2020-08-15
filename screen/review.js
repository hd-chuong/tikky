import React, {useState} from 'react';
import {StyleSheet, View, Text, Button, FlatList, CheckBox} from 'react-native';
import {globalStyles, images} from '../styles/global';
import Card from '../components/card';
import { TextInput } from 'react-native-gesture-handler';

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
        const formatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });
        return "on " + formatter.format(date);
    }
}

export default class Review extends React.Component {
    constructor(props)
    {
        super(props);
        this.navigation = props.navigation;
        this.state = {
            item: this.navigation.getParam('item'),
            checklist: [],
            newCheckbox: {hasDone: false, body: ""}
        }
        this.pressHandler = this.pressHandler.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
    }

    pressHandler()
    {
        var updateReview = this.navigation.getParam('updateReview');
        updateReview(this.state.item.id, this.state.item);
        this.navigation.goBack();
    }
    
    addNewItem()
    {
        let newItem = {...this.state.newCheckbox, id: Date.now()};
        this.setState({checklist: [...this.state.checklist, newItem] });
    }

    render() 
    {
        return (
            <View style={globalStyles.container}>
                    <View style={styles.titleLine}>
                    <TextInput 
                        multiline
                        style={globalStyles.titleText} 
                        defaultValue={this.state.item.title}
                        onChangeText={(newTitle) => {this.setState({item: {...this.state.item, title: newTitle}})}}    
                    /><Text>Created {displayTime(new Date(this.state.item.createdTime))}</Text>
                    </View>
                    <TextInput 
                        multiline 
                        defaultValue={this.state.item.body} 
                        onChangeText={(newBody) => {this.setState({item: {...this.state.item, body: newBody}})} } />
    
                    <View>
                        <FlatList
                        data={this.state.checklist}
                        renderItem={({item}) => {
                            return (<View style={styles.checkboxLine}>
                                        <CheckBox
                                            value={item.hasDone}
                                        /><Text>{item.body}</Text>
                                    </View>
                            )
                        }}
                        />
                        <View style={styles.checkboxLine}>
                            <CheckBox 
                                value={this.state.newCheckbox.hasDone} 
                                onValueChange={() => 
                                        this.setState({
                                                    hasDone: this.state.newCheckbox.hasDone, 
                                                    body: this.state.newCheckbox.body})
                                }/>
                            <TextInput 
                                placeholder={"Enter an item here"} 
                                defaultValue={this.state.newCheckbox.body}
                                onChangeText={(body) => this.setState({newCheckbox: {hasDone: this.state.newCheckbox.hasDone, body}})}
                                onSubmitEditing={()=> {this.addNewItem(); this.setState({newCheckbox: {hasDone: false, body: ""}})}}
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