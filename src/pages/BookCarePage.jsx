import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AVAILABILITY_OPTIONS,
  CARE_LISTINGS,
  CARE_TYPES,
  EXPERIENCE_OPTIONS,
  LANGUAGE_OPTIONS,
  LOCALITIES,
  RATING_OPTIONS,
  SORT_OPTIONS,
} from '../data/careListings'
import './BookCarePage.css'

function StarRating({ value }) {
  const full = Math.round(value)
  return (
    <span className="care-stars" aria-label={`${value} out of 5`}>
      {'★'.repeat(full)}
      <span className="care-stars-empty">{'★'.repeat(Math.max(0, 5 - full))}</span>
    </span>
  )
}

function FilterAccordion({
  id,
  title,
  openId,
  onToggle,
  summary,
  children,
}) {
  const isOpen = openId === id

  return (
    <section className={`book-filter-block${isOpen ? ' is-open' : ''}`}>
      <h2>
        <button
          type="button"
          className="book-filter-trigger"
          aria-expanded={isOpen}
          aria-controls={`filter-panel-${id}`}
          id={`filter-trigger-${id}`}
          onClick={() => onToggle(id)}
        >
          <span className="book-filter-trigger-text">
            <span className="book-filter-trigger-title">{title}</span>
            {summary ? (
              <span className="book-filter-trigger-summary">{summary}</span>
            ) : null}
          </span>
          <span className="book-filter-chevron" aria-hidden="true" />
        </button>
      </h2>
      {isOpen ? (
        <div
          className="book-filter-panel"
          id={`filter-panel-${id}`}
          role="region"
          aria-labelledby={`filter-trigger-${id}`}
        >
          {children}
        </div>
      ) : null}
    </section>
  )
}

function FilterOptions({ options, selected, onSelect, allLabel = 'All' }) {
  return (
    <ul className="book-filter-list">
      <li>
        <button
          type="button"
          className={`book-filter-item${!selected ? ' is-active' : ''}`}
          onClick={() => onSelect('')}
        >
          {allLabel}
        </button>
      </li>
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.id
        const label = typeof option === 'string' ? option : option.label
        return (
          <li key={value}>
            <button
              type="button"
              className={`book-filter-item${selected === value ? ' is-active' : ''}`}
              onClick={() => onSelect(value)}
            >
              {label}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function sortListings(items, sortBy) {
  const next = [...items]

  switch (sortBy) {
    case 'rating-desc':
      return next.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    case 'reviews-desc':
      return next.sort((a, b) => b.reviews - a.reviews)
    case 'enquiries-desc':
      return next.sort((a, b) => b.enquiries - a.enquiries)
    case 'experience-desc':
      return next.sort((a, b) => b.experienceYears - a.experienceYears)
    case 'name-asc':
      return next.sort((a, b) => a.name.localeCompare(b.name))
    case 'relevance':
    default:
      return next.sort((a, b) => {
        if (a.isPremium !== b.isPremium) return a.isPremium ? -1 : 1
        return b.rating - a.rating
      })
  }
}

function BookCarePage() {
  const [searchParams] = useSearchParams()
  const [localityQuery, setLocalityQuery] = useState('')
  const [selectedLocality, setSelectedLocality] = useState('')
  const [selectedCareType, setSelectedCareType] = useState('')
  const [selectedAvailability, setSelectedAvailability] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedExperience, setSelectedExperience] = useState('')
  const [selectedRating, setSelectedRating] = useState('')
  const [premiumOnly, setPremiumOnly] = useState(false)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [showAllLocalities, setShowAllLocalities] = useState(false)
  const [openFilterId, setOpenFilterId] = useState('locality')

  useEffect(() => {
    const locality = searchParams.get('locality') || ''
    const careType = searchParams.get('careType') || ''

    if (locality && LOCALITIES.includes(locality)) {
      setSelectedLocality(locality)
      setOpenFilterId('locality')
    }

    if (careType && CARE_TYPES.includes(careType)) {
      setSelectedCareType(careType)
      setOpenFilterId('careType')
    }
  }, [searchParams])

  function toggleFilter(id) {
    setOpenFilterId((current) => (current === id ? '' : id))
  }

  function optionLabel(options, selected, fallback = 'Any') {
    if (!selected) return fallback
    const match = options.find((option) =>
      typeof option === 'string' ? option === selected : option.id === selected
    )
    if (!match) return selected
    return typeof match === 'string' ? match : match.label
  }

  const filteredLocalities = useMemo(() => {
    const query = localityQuery.trim().toLowerCase()
    const list = query
      ? LOCALITIES.filter((name) => name.toLowerCase().includes(query))
      : LOCALITIES
    return showAllLocalities ? list : list.slice(0, 5)
  }, [localityQuery, showAllLocalities])

  const activeFilterCount = [
    selectedLocality,
    selectedCareType,
    selectedAvailability,
    selectedLanguage,
    selectedExperience,
    selectedRating,
    premiumOnly,
    verifiedOnly,
  ].filter(Boolean).length

  const listings = useMemo(() => {
    const minExperience =
      EXPERIENCE_OPTIONS.find((option) => option.id === selectedExperience)?.minYears ?? 0
    const minRating =
      RATING_OPTIONS.find((option) => option.id === selectedRating)?.minRating ?? 0

    const filtered = CARE_LISTINGS.filter((item) => {
      if (selectedLocality && item.locality !== selectedLocality) return false
      if (selectedCareType && item.careType !== selectedCareType) return false
      if (
        selectedAvailability &&
        !item.availability.includes(selectedAvailability)
      ) {
        return false
      }
      if (selectedLanguage && !item.languages.includes(selectedLanguage)) {
        return false
      }
      if (selectedExperience && item.experienceYears < minExperience) return false
      if (selectedRating && item.rating < minRating) return false
      if (premiumOnly && !item.isPremium) return false
      if (verifiedOnly && !item.isVerified) return false
      return true
    })

    return sortListings(filtered, sortBy)
  }, [
    selectedLocality,
    selectedCareType,
    selectedAvailability,
    selectedLanguage,
    selectedExperience,
    selectedRating,
    premiumOnly,
    verifiedOnly,
    sortBy,
  ])

  function clearFilters() {
    setSelectedLocality('')
    setSelectedCareType('')
    setSelectedAvailability('')
    setSelectedLanguage('')
    setSelectedExperience('')
    setSelectedRating('')
    setPremiumOnly(false)
    setVerifiedOnly(false)
    setLocalityQuery('')
  }

  return (
    <div className="book-care">
      <div className="book-care-inner">
        <nav className="book-care-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Karnataka</span>
          <span aria-hidden="true">/</span>
          <span>Bangalore</span>
        </nav>

        <header className="book-care-header">
          <h1>Caregivers & care services in Bangalore</h1>
          <p>
            Compare trusted home care, assisted living, nursing support, and more.
            Use filters and sort to find the right fit.
          </p>
        </header>

        <div className="book-care-layout">
          <aside className="book-care-sidebar" aria-label="Filters">
            <div className="book-filter-toolbar">
              <p className="book-filter-toolbar-title">
                Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
              </p>
              {activeFilterCount > 0 ? (
                <button type="button" className="book-filter-clear" onClick={clearFilters}>
                  Clear all
                </button>
              ) : null}
            </div>

            <FilterAccordion
              id="locality"
              title="Localities"
              openId={openFilterId}
              onToggle={toggleFilter}
              summary={selectedLocality || 'All'}
            >
              <label className="book-filter-search" htmlFor="locality-search">
                <span className="visually-hidden">Search locality</span>
                <input
                  id="locality-search"
                  type="search"
                  placeholder="Search locality"
                  value={localityQuery}
                  onChange={(event) => setLocalityQuery(event.target.value)}
                />
              </label>
              <ul className="book-filter-list">
                <li>
                  <button
                    type="button"
                    className={`book-filter-item${!selectedLocality ? ' is-active' : ''}`}
                    onClick={() => setSelectedLocality('')}
                  >
                    All localities
                  </button>
                </li>
                {filteredLocalities.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      className={`book-filter-item${
                        selectedLocality === name ? ' is-active' : ''
                      }`}
                      onClick={() => setSelectedLocality(name)}
                    >
                      <span className="book-filter-pin" aria-hidden="true" />
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
              {LOCALITIES.length > 5 ? (
                <button
                  type="button"
                  className="book-filter-more"
                  onClick={() => setShowAllLocalities((prev) => !prev)}
                >
                  {showAllLocalities ? 'Show less' : '+ All localities'}
                </button>
              ) : null}
            </FilterAccordion>

            <FilterAccordion
              id="careType"
              title="Care types"
              openId={openFilterId}
              onToggle={toggleFilter}
              summary={optionLabel(CARE_TYPES, selectedCareType, 'All')}
            >
              <FilterOptions
                options={CARE_TYPES}
                selected={selectedCareType}
                onSelect={setSelectedCareType}
                allLabel="All types"
              />
            </FilterAccordion>

            <FilterAccordion
              id="availability"
              title="Availability"
              openId={openFilterId}
              onToggle={toggleFilter}
              summary={optionLabel(
                AVAILABILITY_OPTIONS,
                selectedAvailability,
                'Any'
              )}
            >
              <FilterOptions
                options={AVAILABILITY_OPTIONS}
                selected={selectedAvailability}
                onSelect={setSelectedAvailability}
                allLabel="Any availability"
              />
            </FilterAccordion>

            <FilterAccordion
              id="language"
              title="Languages"
              openId={openFilterId}
              onToggle={toggleFilter}
              summary={optionLabel(LANGUAGE_OPTIONS, selectedLanguage, 'Any')}
            >
              <FilterOptions
                options={LANGUAGE_OPTIONS}
                selected={selectedLanguage}
                onSelect={setSelectedLanguage}
                allLabel="Any language"
              />
            </FilterAccordion>

            <FilterAccordion
              id="experience"
              title="Experience"
              openId={openFilterId}
              onToggle={toggleFilter}
              summary={optionLabel(EXPERIENCE_OPTIONS, selectedExperience, 'Any')}
            >
              <FilterOptions
                options={EXPERIENCE_OPTIONS}
                selected={selectedExperience}
                onSelect={setSelectedExperience}
                allLabel="Any experience"
              />
            </FilterAccordion>

            <FilterAccordion
              id="rating"
              title="Rating"
              openId={openFilterId}
              onToggle={toggleFilter}
              summary={optionLabel(RATING_OPTIONS, selectedRating, 'Any')}
            >
              <FilterOptions
                options={RATING_OPTIONS}
                selected={selectedRating}
                onSelect={setSelectedRating}
                allLabel="Any rating"
              />
            </FilterAccordion>

            <FilterAccordion
              id="more"
              title="More"
              openId={openFilterId}
              onToggle={toggleFilter}
              summary={
                [premiumOnly && 'Premium', verifiedOnly && 'Verified']
                  .filter(Boolean)
                  .join(', ') || 'Any'
              }
            >
              <ul className="book-filter-list">
                <li>
                  <label className="book-filter-check">
                    <input
                      type="checkbox"
                      checked={premiumOnly}
                      onChange={(event) => setPremiumOnly(event.target.checked)}
                    />
                    Premium only
                  </label>
                </li>
                <li>
                  <label className="book-filter-check">
                    <input
                      type="checkbox"
                      checked={verifiedOnly}
                      onChange={(event) => setVerifiedOnly(event.target.checked)}
                    />
                    Verified only
                  </label>
                </li>
              </ul>
            </FilterAccordion>
          </aside>

          <div className="book-care-results">
            <div className="book-care-results-bar">
              <p className="book-care-count" role="status">
                {listings.length} care option{listings.length === 1 ? '' : 's'} found
              </p>
              <label className="book-care-sort" htmlFor="care-sort">
                <span>Sort by</span>
                <select
                  id="care-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {listings.length === 0 ? (
              <p className="book-care-empty">
                No matches for these filters. Try clearing some filters or change
                sort.
              </p>
            ) : (
              <ul className="book-care-list">
                {listings.map((item) => (
                  <li key={item.id} className="care-listing-card">
                    <div
                      className="care-listing-media"
                      style={{ '--care-tone': item.imageTone }}
                    >
                      {item.isPremium ? (
                        <span className="care-listing-badge">Premium</span>
                      ) : null}
                      <span className="care-listing-initial" aria-hidden="true">
                        {item.name.charAt(0)}
                      </span>
                    </div>

                    <div className="care-listing-body">
                      <h2>
                        {item.name}
                        {item.isVerified ? (
                          <span className="care-listing-verified">Verified</span>
                        ) : null}
                      </h2>
                      <p className="care-listing-location">
                        <span className="book-filter-pin" aria-hidden="true" />
                        {item.locality}, {item.city}
                      </p>
                      <p className="care-listing-rating">
                        <StarRating value={item.rating} />
                        <span>{item.rating.toFixed(1)} / 5</span>
                        <span className="care-listing-reviews">
                          ({item.reviews} reviews)
                        </span>
                      </p>
                      <ul className="care-listing-meta">
                        <li>{item.careType}</li>
                        <li>{item.experienceYears}+ years</li>
                        {item.availability.map((slot) => (
                          <li key={slot}>{slot}</li>
                        ))}
                        <li>{item.languages.join(', ')}</li>
                      </ul>
                      <p className="care-listing-enquiries">
                        {item.enquiries} people enquired recently
                      </p>
                    </div>

                    <div className="care-listing-aside">
                      <button type="button" className="care-listing-cta">
                        Check availability
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookCarePage
