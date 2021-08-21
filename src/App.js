import React from "react";
import axios from "axios";
import styles from "./App.module.css";
import SearchForm from "./SearchForm";
import List from "./List";

const title = "React";

const welcome = {
  greeting: "Welcome",
  title: "to StoryFinder",
};

// function will save key; even when browser gets refreshed
const useSemiPersistentState = (key, initialState) => {
  // if key exist in local call; otherwise, use initialState
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  // set key and value to local storage when value or key changes
  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue];
};

// const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";
const API_BASE = "https://hn.algolia.com/api/v1";
const API_SEARCH = "/search";
const PARAM_SEARCH = "query=";
const PARAM_PAGE = "page=";

// grab ?query=searchTerm& and remove query= from string
const extractSearchTerm = (url) =>
  url
    .substring(url.lastIndexOf("?") + 1, url.lastIndexOf("&"))
    .replace(PARAM_SEARCH, "");

const getUrl = (searchTerm, page) =>
  `${API_BASE}${API_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`;

// group identical searches to prevent duplicate buttons from appearing
const getLastSearches = (urls) =>
  urls
    .reduce((result, url, index) => {
      const searchTerm = extractSearchTerm(url);

      if (index == 0) return result.concat(searchTerm);

      const previousSearchTerm = result[result.length - 1];

      // if searchTerm is same as prev search then just return
      if (searchTerm === previousSearchTerm) {
        return result;
      } else {
        return result.concat(searchTerm);
      }
    }, [])
    .slice(-6)
    .slice(0, -1);

// function created to be called in a useReducer hook
// handles specfic actions such as state loading, stories retrieved,
// state errors, and story removal
const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data:
          action.payload.page === 0
            ? action.payload.list
            : state.data.concat(action.payload.list),
        page: action.payload.page,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

// Frontend Component (what the users will see)
const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState(
    "search",
    "Hacker"
  );

  // used to save user's input in a state
  const handleSearchInput = (event) => {
    setSearchTerm(event.target.value);
  };

  const [urls, setUrls] = React.useState([getUrl(searchTerm, 0)]);

  const handleSearchSubmit = (event) => {
    handleSearch(searchTerm, 0);

    event.preventDefault(); // prevent Form from refreshing
  };

  const handleLastSearch = (searchTerm) => {
    setSearchTerm(searchTerm); // update input field text
    handleSearch(searchTerm, 0);
  };

  // created to be put into handleSearchSubmit and handleLastSearch
  const handleSearch = (searchTerm, page) => {
    const url = getUrl(searchTerm, page);
    setUrls(urls.concat(url));
  };

  const lastSearches = getLastSearches(urls);

  // takes reduce func and initial state as arguments; returns array
  // with curr state and state updater function
  const [stories, dispatchStories] = React.useReducer(storiesReducer, {
    data: [],
    page: 0,
    isLoading: false,
    isError: false,
  });

  // using axios with memozied and async & await
  // everytime url changes, we re-fetch data.
  const handleFetchStories = React.useCallback(async () => {
    dispatchStories({ type: "STORIES_FETCH_INIT" });

    // axios wrap result in data object
    try {
      const lastUrl = urls[urls.length - 1];
      const result = await axios.get(lastUrl);

      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: { list: result.data.hits, page: result.data.page },
      });
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" });
    }
  }, [urls]);

  // call memoized function, and if this function changes, call it
  React.useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  // remove items permanently until refreshed
  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    });
  };

  // increment page #
  const handleMore = () => {
    const lastUrl = urls[urls.length - 1]; // get prev url
    const searchTerm = extractSearchTerm(lastUrl);
    handleSearch(searchTerm, stories.page + 1);
  };

  // check if we're at the bottom of the page, and if so, load the next page
  const handleScroll = (event) => {
    const target = event.target;

    if (target.scrollHeight - target.scrollTop === target.clientHeight) {
      if (stories.isLoading)
        document.getElementById("loading").innerHTML = "Loading...";
      else handleMore();
    }
  };

  return (
    <div className={styles.container} onScroll={handleScroll}>
      <h1 className={styles.headlinePrimary}>
        {welcome.greeting} {welcome.title}
      </h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      <LastSearches
        lastSearches={lastSearches}
        onLastSearch={handleLastSearch}
      />

      {stories.isError && <p>Something went wrong...</p>}

      <List list={stories.data} onRemoveItem={handleRemoveStory} />

      <p id="loading"></p>
    </div>
  );
};

// LastSearches Component
const LastSearches = ({ lastSearches, onLastSearch }) => (
  <>
    {lastSearches.map((searchTerm, index) => (
      <button
        key={searchTerm + index}
        type="button"
        className={`${styles.button} ${styles.buttonSmall}`}
        onClick={() => onLastSearch(searchTerm)}
      >
        {searchTerm}
      </button>
    ))}
  </>
);

export default App;
