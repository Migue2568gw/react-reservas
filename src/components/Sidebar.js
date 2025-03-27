import React from "react";

const Sidebar = ({ title, items, onNavigate }) => {
  const handleNavigation = (item) => {  
    onNavigate(item.toLowerCase()); 
  };

  return (
    <div className="sidebar">
      <h2>{title}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index} className="product-card">
            <p onClick={() => handleNavigation(item)}>{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
