import React from 'react'
import ReactDOM from 'react-dom'
import Moment from 'react-moment'

// components
import Chart from './components/Chart'

// images
import virus from './images/virus/red.svg'

// style
import './app.css'

// data
import data from '../data.json'

function App (props) {
  // sort timeline data descending
  data.timeline.sort((a, b) => new Date(b.date) - new Date(a.date))

  const lastAntibody = data.timeline.find(({ type }) => type === 'antibody')

  return (
    <div className='app'>
      <div className='header'>
        <img src={virus} />
        <h1>Personal Covid-19 Tracker</h1>
      </div>

      <div className='content'>
        <table>
          <tbody>
            <tr>
              <th>Data last updated</th>
              <td><Moment withTitle fromNow>{data.lastUpdatedAt}</Moment></td>
            </tr>
            <tr>
              <th>Latest antibody count</th>
              {lastAntibody ? (
                <td>{lastAntibody.value} {data.antibodyUnit}</td>
              ) : (
                <td>unknown?</td>
              )}
            </tr>
            {data.timeline.filter(({ type }) => type === 'vaccine').reverse().map((entry, index) => (
              <tr key={`vaccine-index-${index}`}>
                <th>Vaccination {entry.notes ? `(${entry.notes})` : ''}</th>
                <td><Moment withTitle format='LL'>{entry.date}</Moment></td>
              </tr>
            ))}
          </tbody>
        </table>

        {lastAntibody ? (
          <Chart title='Antibody Timeline' data={data} />
        ) : ''}
      </div>

      <div className='footer'>
        <p>* Timeline data is also available in JSON format at: <a href='/data.json' target='_blank'>{`${window.location.protocol}//${window.location.host}/data.json`}</a></p>
        <ul>
          <li><a href='https://github.com/eymengunay/covid-19' target='_blank'>Repository</a></li>
          <li>|</li>
          <li><a href='/data.json' target='_blank'>JSON API</a></li>
          <li>|</li>
          <li><a href='https://xkcd.com' target='_blank'>XKCD</a></li>
        </ul>
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

// hot module replacement
if (module.hot) module.hot.accept()