import React, { useEffect, useRef } from 'react'
// import chartXKCD from 'chart.xkcd'
import chartXKCD from '../../vendor/chart.xkcd/src/index'
import scaleTime from 'd3-scale/src/time'

function Chart (props) {
  const ref = useRef(null)

  useEffect(() => {
    const data = {
      datasets: [{
        label: 'Antibody Count',
        data: [],
        options: {
          showLine: true,
          tooltipText: (label, d) => {
            return `${label}: ${d.y} ${props.data.antibodyUnit}`
          }
        }
      }, {
        label: 'Vaccination',
        data: [],
        options: {
          type: 'marker',
          tooltipText: (label, d) => {
            return `${d.vaccine}: ${d.notes}`
          }
        }
      }]
    }
    
    // fill antibody dataset
    data.datasets[0].data = props.data.timeline
      .filter(entry => entry.type === 'antibody')
      .map(entry => {
        return {
          x: entry.date,
          y: entry.value
        }
      })

    // fill vaccination dataset
    data.datasets[1].data = props.data.timeline
      .filter(entry => entry.type === 'vaccine')
      .map(entry => {
        return {
          x: entry.date,
          y: 50,
          notes: entry.notes,
          vaccine: entry.vaccine
        }
      })

    const xkcd = new chartXKCD.XY(ref.current, {
      title: props.title,
      xLabel: 'Timestamp',
      yLabel: props.data.antibodyUnit,
      data,
      options: {
        showLine: true,
        height: 400,
        xTickCount: 3,
        yTickCount: 4,
        legendPosition: chartXKCD.config.positionType.upLeft,
        timeFormat: 'MMM DD, YYYY',
        dotSize: 1.5
      }
    })
  })

  return (
    <svg ref={ref}></svg>
  )
}

export default Chart