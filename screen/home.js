import React, {useContext, useState, useEffect, Component} from 'react';
import {
        StyleSheet, 
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

import {ReviewsContext} from '../provider/reviewProvider';

const Home = ({navigation}) => {

    const [modalOpen, setModalOpen] = useState(false);
    const reviews = useContext(ReviewsContext);

    let emptyMessage = null;
    
    let homeReviews = reviews.reviews.filter((item) => (item.isArchive == 0));
    if (homeReviews.length == 0)
    {
        emptyMessage = <Text>There is no stickie left.</Text>
    }
    
    return (<ImageBackground source={require('../assets/game_bg.png')} style={globalStyles.container}>
            <Modal visible={modalOpen} animationType='slide' style={styles.modalContent}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContent}>
                        <MaterialIcons
                            name='close'
                            size={24}
                            style={{...styles.modalToggle, ...styles.modalClose}}
                            onPress={() => {setModalOpen(false)}}
                        />
                        <ReviewForm addReview={(review) => {reviews.addReview(review); setModalOpen(false)} }/>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            
            <View style={styles.toolPanel}>                    
                <MaterialIcons
                    name='add'
                    size={24}
                    style={styles.modalToggle}
                    onPress={() => {
                        setModalOpen(true);
                    }}
                />

                <MaterialIcons
                    name='delete'
                    size={24}
                    style={styles.modalToggle}
                    onPress={reviews.alertRemove}
                />
            </View>

            <FlatList
                data={homeReviews}
                renderItem={({item}) => {
                    return (
                        <TouchableOpacity onPress={()=> navigation.navigate('Review', {item, updateReview: reviews.updateReviews})}>
                            <Card>
                                <Text style={globalStyles.titleText}>{item.title}
                                <MaterialIcons name='archive' size={18} onPress={() => {reviews.archive(item.id)}}></MaterialIcons></Text>
                            </Card>
                        </TouchableOpacity>
                    )
                }}
            />
        </ImageBackground>);
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
