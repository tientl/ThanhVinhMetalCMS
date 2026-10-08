import React from 'react'

import { getNavigation, getSiteSettings } from '@/lib/data'

import { HeaderClient } from './HeaderClient'

export const Header = async () => {
  const [navigation, settings] = await Promise.all([getNavigation(), getSiteSettings()])
  return <HeaderClient navigation={navigation} settings={settings} />
}
