import React from 'react';

export default function SearchFilter({ placeholder, onSearch, onFilter, filterOptions }) {
    return (
        <div className="premium-toolbar">
            <div className="form-group search-group">
                <div className="input-with-icon">
                    <span className="input-icon">🔍</span>
                    <input
                        id="admin-search"
                        type="text"
                        placeholder=" "
                        onChange={(e) => onSearch(e.target.value)}
                        className="search-input"
                    />
                    <label htmlFor="admin-search">{placeholder || "Search records..."}</label>
                </div>
            </div>
            {filterOptions && (
                <div className="form-group filter-group">
                    <div className="input-with-icon select-wrapper">
                        <span className="input-icon">🎯</span>
                        <select
                            id="admin-filter"
                            onChange={(e) => onFilter(e.target.value)}
                            className="filter-select"
                        >
                            {filterOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
