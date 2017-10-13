import React from 'react'

/**
 * @return {null}
 */
export default function ApiFormResultPageCount({page, pageSize, resultCount}) {
  if (!page || !pageSize || !resultCount) {
    return null
  }

  const pageValue = page.id;
  const pageSizeValue = pageSize.id;
  const startIndex = (pageValue - 1) * pageSizeValue + 1;

  let endIndex = pageValue * pageSizeValue;
  if (endIndex > resultCount) {
    endIndex = resultCount
  }

  return <span>({startIndex} - {endIndex} / {resultCount})</span>
}