import React from 'react';
import {StyleSheet, View, TextInput, Button, Image, Text} from 'react-native';
import {globalStyles, images} from '../styles/global';
import {Formik} from 'formik';
import * as yup from 'yup';
import FlatButton from '../components/flatButton';

const ReviewSchema = yup.object({
    title: yup
            .string().
            required().
            min(4),
    body: yup
            .string()
            .required()
            .min(8),
    // rating: yup.string()
    //             .required()
    //             .test('is-num-1-5',
    //                 'rating must be a number 1 - 5',
    //                 (val) => {
    //                     return parseInt(val) < 6 && parseInt(val) > 0;
    //                 })
})

export default function ReviewForm({addReview}) {
    return (
        <View style={globalStyles.container}>
        <Formik
            initialValues={{
                title: '',
                body: '',
                rating: '', 
            }}
            validationSchema={ReviewSchema}
            onSubmit={(values, actions) => {
                // console.log(values);
                actions.resetForm();
                addReview(values);
            }}
        >
        {(props) => (
            <View>
                <TextInput 
                    style={globalStyles.input}
                    placeholder='Review title'
                    onChangeText={props.handleChange('title')}
                    value={props.values.title}
                    onBlur={props.handleBlur('title')}
                />
                <Text style={globalStyles.errorText}>{props.touched.title && props.errors.title}</Text>              
                
                <TextInput 
                    multiline
                    style={globalStyles.input}
                    placeholder='Review body'
                    onChangeText={props.handleChange('body')}
                    value={props.values.body}
                    onBlur={props.handleBlur('body')}
                />
                <Text style={globalStyles.errorText}>{props.touched.body && props.errors.body}</Text>

                <FlatButton text='Submit' onPress={props.handleSubmit}/>
            </View>
        )}
        </Formik>

        </View>
    )
}