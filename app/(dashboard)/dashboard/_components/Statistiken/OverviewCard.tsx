import Image from 'next/image'

export default function OverviewCard () {
  const kpiCards = [
    {
      title: 'Gesamtumsatz',
      value: '287.4k €',
      trend: '+10.0%',
      trendLabel: 'vs. Vorperiode',
      isPositive: true,
      icon: '$'
    },
    {
      title: 'Gesamtausgaben',
      value: '142.8k €',
      trend: '+3.2%',
      trendLabel: 'vs. Vorperiode',
      isPositive: true,
      icon: '/icons/cart.png'
    },
    {
      title: 'Deckungsbeitrag',
      value: '144.7k €',
      trend: '+17.8%',
      trendLabel: 'vs. Vorperiode',
      isPositive: true,
      icon: '/icons/graph-stats.png'
    },
    {
      title: 'Gewinn',
      value: '89.2k €',
      trend: '+13.6%',
      trendLabel: 'vs. Vorperiode',
      isPositive: true,
      icon: '/icons/analytics-board.png'
    },
    {
      title: 'Ø Bearbeitungszeit',
      value: '4.2h',
      trend: '-12.5%',
      trendLabel: 'vs. Vorperiode',
      isPositive: false,
      icon: '/icons/time.png'
    },
    {
      title: 'Reklamationsquote',
      value: '3.2%',
      trend: '+15.8%',
      trendLabel: 'vs. Vorperiode',
      isPositive: true,
      icon: '/icons/alert.png'
    },
    {
      title: 'Nacharbeitsquote',
      value: '5.1%',
      trend: '+17.7%',
      trendLabel: 'vs. Vorperiode',
      isPositive: true,
      icon: '/icons/alert.png'
    },
    {
      title: 'Vollpreisanteil',
      value: '72%',
      trend: '+5.9%',
      trendLabel: 'vs. Vorperiode',
      isPositive: true,
      icon: '%'
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6'>
      {kpiCards.map((card, index) => (
        <div
          key={index}
          className='bg-white border border-gray-200 rounded-lg p-5 shadow-xs'
        >
          <div className='flex justify-between items-start mb-3'>
            <h3 className='font-semibold text-gray-700 text-sm'>
              {card.title}
            </h3>
            <div className='relative w-6 h-6'>
              {/* if icon is a string then show the icon otherwise show the image */}
              {card.icon.includes('.png') ? (
                <Image
                  src={card.icon}
                  alt={card.title}
                  width={20}
                  height={20}
                  className='object-contain'
                />
              ) : (
                <div className='text-xl text-gray-800'>{card.icon}</div>
              )}
            </div>
          </div>
          <div className='text-2xl font-bold text-gray-900 mb-2'>
            {card.value}
          </div>
          <div
            className={`text-xs font-semibold flex items-center gap-1 ${
              card.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <span>{card.isPositive ? '↑' : '↓'}</span>
            <span>
              {card.trend} {card.trendLabel}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
