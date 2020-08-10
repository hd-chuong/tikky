import React, {useState} from 'react';
import {StyleSheet, View, Text, Button, Image} from 'react-native';
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
        return "A few seconds ago.";
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

export default function Review({navigation}) {

    const [item, setItem] = useState(navigation.getParam('item'));
    const pressHandler = () => {
        var updateReview = navigation.getParam('updateReview');
        updateReview(item.id, item);
        navigation.goBack();
    }

    return (
        <View style={globalStyles.container}>
                <TextInput 
                    style={globalStyles.titleText} 
                    defaultValue={navigation.getParam('item').title}
                    onChangeText={(newTitle) => {setItem({...item, title: newTitle})}}    
                />

                <TextInput defaultValue={navigation.getParam('item').body} onChangeText={(newBody) => {setItem({...item, body: newBody})} } />
                <Text>Created {displayTime(new Date(navigation.getParam('item').createdTime))}</Text>
                <Button title='Update' onPress={pressHandler}/>
        </View>
    )
}
