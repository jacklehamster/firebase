# Translation table

Translation table : http://jacklehamster.github.io/firebase/data-table

A table where we can add data. Used mainly for storing translations in Firebase database. Feel free to change the data below, this is just samples for demo.

Source code: https://github.com/jacklehamster/firebase/tree/gh-pages/data-table
Main file: datatable.js
________

The translation table uses Firebase to store data translation in the following format:

{
   "translations": {
       "en": {
           "hello": {
               value: "hello"
           }
       },
       "fr": {
           "hello": {
               value: "Bonjours"
           }
       }
    }
}

Since the data is accessible from any program, it can be used to streamline the localization of apps or games dynamically. The app sends a missing string to the firebase store, and a new entry gets created. Then the table is used to manually enter the translation for the sentence that's missing translation.
