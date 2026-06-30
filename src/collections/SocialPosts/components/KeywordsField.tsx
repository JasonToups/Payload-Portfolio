'use client'

import KeywordsTagInput from '@/components/KeywordsTagInput'

/**
 * Main-column keyword input for Social Posts — the same tag-style create-inline
 * UX as Posts, without the sidebar styling (Posts' keywords field lives in the
 * sidebar; this one is in the main column).
 */
export const KeywordsField: React.FC = () => {
  return (
    <div className="field-type" style={{ marginBottom: '16px' }}>
      <KeywordsTagInput helperText="Used as hashtags when publishing. Press , Tab, or Enter to add." />
    </div>
  )
}

export default KeywordsField
