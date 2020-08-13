import React from 'react';
import * as SQLite from 'expo-sqlite';
import update from 'react-addons-update';
import {Alert} from 'react-native';

const db = SQLite.openDatabase("db.db");
const ReviewsContext = React.createContext();

class ReviewProvider extends React.Component {
    constructor(props)
    {
        super(props);
        this.deleteAll = this.deleteAll.bind(this);
        this.addReview = this.addReview.bind(this);
        this.load = this.load.bind(this);
        this.archive = this.archive.bind(this);
        this.alertRemove = this.alertRemove.bind(this);
        this.updateReviews = this.updateReviews.bind(this);
        this.unarchive = this.unarchive.bind(this);
        this.state = {
            reviews: [],
        };

        this.load();
    }

    async updateReviews(id, newData)
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

    async addReview(review)
    {
        review.id = Date.now();
        review.createdTime = Date.now();
        review.isArchive = 0;

        this.setState( {reviews: [review,...this.state.reviews] });
    

        db.transaction(
            (tx) => {
                tx.executeSql("insert into reviews (id, title, body, createdTime, isArchive) values (?, ?, ?, ?, 0);", 
                [review.id, review.title, review.body, review.createdTime]);
            }, () => console.log("fail add review"));
    }

    async alertRemove() 
    {
        Alert.alert("Dangerous", "Do you want to delete all items?",
        [{text: "Yes", onPress: () => this.deleteAll()},
         {text: "No", onPress: () => {("cancel")}}],
         {cancelable: true}
        )
    }

    async archive(id)
    {
        db.transaction(
            (tx) => {
                tx.executeSql("UPDATE reviews SET isArchive = 1 WHERE id = ?;", [id]);
            }, () => {console.log("fail"), () => {console.log("success")}}
            );
        
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

    async unarchive(id)
    {
        db.transaction(
            (tx) => {
                tx.executeSql("UPDATE reviews SET isArchive = 0 WHERE id = ?;", [id]);
            }, () => {console.log("fail"), () => {console.log("success")}}
        );
        
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
                        $set: {...this.state.reviews[targetIndex], isArchive : 0}
                    }
                }
            }))
        }
    }

    render() 
    {
        return (
            <ReviewsContext.Provider 
                value={{
                    reviews: this.state.reviews,
                    deleteAll: this.deleteAll,
                    updateReviews: this.updateReviews,
                    alertRemove: this.alertRemove,
                    archive: this.archive,
                    addReview: this.addReview,
                    unarchive: this.unarchive,
                }}
            >
            {this.props.children}
            </ReviewsContext.Provider>
        )
    }
}

export { ReviewsContext, ReviewProvider };