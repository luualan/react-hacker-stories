import React from "react";
import styles from "./App.module.css";
import { ReactComponent as Check } from "./images/check.svg";
import { sortBy } from "lodash";

// create an object called SORTS and sorts each property base on the list's
// property types
const SORTS = {
  NONE: (list) => list,
  TITLE: (list) => sortBy(list, "title"),
  AUTHOR: (list) => sortBy(list, "author"),
  COMMENT: (list) => sortBy(list, "num_comments").reverse(),
  POINT: (list) => sortBy(list, "points").reverse(),
};

// list component
const List = ({ list, onRemoveItem }) => {
  const [sort, setSort] = React.useState({ sortKey: "NONE", isReverse: false });

  // toggle sort to be ascending and descending
  const handleSort = (sortKey) => {
    const isReverse = sort.sortKey === sortKey && !sort.isReverse;
    setSort({ sortKey: sortKey, isReverse });
  };

  const sortFunction = SORTS[sort.sortKey];
  const sortedList = sort.isReverse
    ? sortFunction(list).reverse()
    : sortFunction(list);

  return (
    <div>
      {/* headers */}
      <div style={{ display: "flex" }}>
        <span style={{ width: "40%" }}>
          <button
            type="button"
            onClick={() => handleSort("TITLE")}
            className={`${styles.button} ${styles.buttonSmall}`}
          >
            Title
          </button>
        </span>
        <span style={{ width: "30%" }}>
          <button
            type="button"
            onClick={() => handleSort("AUTHOR")}
            className={`${styles.button} ${styles.buttonSmall}`}
          >
            Author
          </button>
        </span>
        <span style={{ width: "10%" }}>
          <button
            type="button"
            onClick={() => handleSort("COMMENT")}
            className={`${styles.button} ${styles.buttonSmall}`}
          >
            Comments
          </button>
        </span>
        <span style={{ width: "10%" }}>
          <button
            type="button"
            onClick={() => handleSort("POINT")}
            className={`${styles.button} ${styles.buttonSmall}`}
          >
            Points
          </button>
        </span>
        <span style={{ width: "10%" }}>Actions</span>
      </div>

      {/* displays sorted list */}
      {sortedList.map((item) => (
        <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
      ))}
    </div>
  );
};

// item component that displays item's data
const Item = ({ item, onRemoveItem }) => (
  <div style={{ display: "flex" }}>
    <span style={{ width: "40%" }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: "30%" }}>{item.author}</span>
    <span style={{ width: "10%" }}>{item.num_comments}</span>
    <span style={{ width: "10%" }}>{item.points}</span>
    <span style={{ width: "10%" }}>
      <button
        type="button"
        onClick={() => onRemoveItem(item)}
        className={`${styles.button} ${styles.buttonSmall}`}
      >
        <Check height="18px" width="18px" />
      </button>
    </span>
  </div>
);

export default List;
