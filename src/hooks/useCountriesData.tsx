import React from 'react'
import { getCountries, getCountryCallingCode } from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'

type FormattedCountry = {
  label: string
  code: string
  image: string
  countryCode: string
}

function useCountriesData() {
  const getAllCountriesData = (): FormattedCountry[] => {
    const countries = getCountries()
    const formattedData: FormattedCountry[] = countries.map((countryCode) => {
      const callingCode = `+${getCountryCallingCode(countryCode)}`
      // Get country name from the country code
      const countryName =
        new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode

      // Get flag component from the flags object
      const FlagComponent = flags[countryCode as keyof typeof flags]

      // Convert flag component to data URL or use SVG
      let flagImage = ''
      if (FlagComponent) {
        // For now, we'll use a flag CDN, but you can render the component if needed
        flagImage = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`
      }

      return {
        label: countryName,
        code: callingCode,
        image: flagImage,
        countryCode: countryCode,
      }
    })

    // Sort by country name
    return formattedData.sort((a, b) => a.label.localeCompare(b.label))
  }

  const countries = React.useMemo(() => {
    return getAllCountriesData()
  }, [])

  return { countries }
}

export { useCountriesData }
