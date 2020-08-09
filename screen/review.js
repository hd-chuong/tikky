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
        return "" + Math.floor(tickDiff / 1000 / 60) + " min ago.";
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

    const [title, setTitle] = useState(navigation.getParam('title'));
    const [body, setBody] = useState(navigation.getParam('body'));
    const key = navigation.getParam('key');
    const pressHandler = () => {
        var updateReview = navigation.getParam('updateReview');
        updateReview(key, {title: title, body: body, key: key, createdTime: navigation.getParam('createdTime'), rating: navigation.getParam('rating')});
        
        console.log('new title', title);
        console.log('new body', body);
        navigation.goBack();
    }

    return (
        <View style={globalStyles.container}>
                <TextInput 
                    style={globalStyles.titleText} 
                    defaultValue={navigation.getParam('title')}
                    onChangeText={(newTitle) => {setTitle(newTitle)}}    
                />
                <TextInput defaultValue={navigation.getParam('body')} onChangeText={(newBody) => {setBody(newBody)}} />
                
                <Text>Created {displayTime(new Date(navigation.getParam('createdTime')))}</Text>
                <Button title='Update' onPress={pressHandler}/>
        </View>
    )
}

const styles = StyleSheet.create({

});

// const styles = StyleSheet.create({
//     container: {
//         padding: 24
//     }
// })