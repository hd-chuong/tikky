import React from 'react';
import {StyleSheet, View} from 'react-native';

export default function Card(props) {
    return (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {props.children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create(
    {
        card: {
            borderRadius: 6,
            elevation: 3,
            shadowOffset: {width: 1, height: 1},
            shadowColor: "#333",
            backgroundColor: "#fff",
            shadowRadius: 2,
            shadowOpacity: 0.3,
            marginHorizontal: 4,
            marginVertical: 6,
            flexDirection: 'row'
        },

        cardContent: {
            padding: 10
        }

    }
);