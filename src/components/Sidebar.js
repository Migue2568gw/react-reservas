import React from "react";

const Sidebar = ({ title, items }) => {
  return (
    <div className="sidebar">
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index} className="product-card">
            <p>{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
