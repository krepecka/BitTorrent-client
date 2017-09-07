import React from 'react';
import ReactDOM from 'react-dom';
import { Doughnut } from 'react-chartjs-2';

const PercentageIndicator = (props) => {
    const data = {
        datasets: [{
            data: [props.value, 100 - props.value],
            backgroundColor: [
                '#26a69a',
                '#616161',
            ],
            borderWidth: 1,
            borderColor: '#575757',
            hoverBackgroundColor: [
                '#33c7b9',
                '#616161'
            ]
        }]
    };

    const options = {
        tooltips: {
            enabled: false
        },
        maintainAspectRatio: false,
        responsive: true,
    }

    return (
        <div style={{width: '130px', height: '130px', position: 'absolute', bottom: '55px'}}>
            <div style={{top: '50%', left: '50%', position: 'absolute', fontSize: '16px', margin: '-6px 0 0 -14px'}}>
                {props.value}%
            </div>
            <Doughnut data={data} options={options}/>
        </div>
    )
    ;
}

export default PercentageIndicator;