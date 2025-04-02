import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { getTaskRecords } from '../services/api';

const Visualizations = ({ taskId }) => {
    const lineChartRef = useRef(null);
    const barChartRef = useRef(null);
    const [records, setRecords] = useState([]);
    const [filterYear, setFilterYear] = useState('');

    useEffect(() => {
        if (!taskId) return;

        const fetchData = async () => {
            try {
                const data = await getTaskRecords(taskId);
                setRecords(data);
            } catch (error) {
                console.error('Error fetching records:', error);
            }
        };

        fetchData();
    }, [taskId]);

    useEffect(() => {
        if (records.length === 0) return;

        const filteredData = filterYear
            ? records.filter(r => new Date(r.sale_date).getFullYear() === parseInt(filterYear))
            : records;

        drawLineChart(filteredData);
        drawBarChart(filteredData);
    }, [records, filterYear]);

    const drawLineChart = (data) => {
        const svg = d3.select(lineChartRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const x = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.sale_date)))
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.price)])
            .range([height, 0]);

        const line = d3.line()
            .x(d => x(new Date(d.sale_date)))
            .y(d => y(d.price));

        const chart = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        chart.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        chart.append('g')
            .call(d3.axisLeft(y));

        chart.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);
    };

    const drawBarChart = (data) => {
        const svg = d3.select(barChartRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const aggregatedData = d3.rollup(
            data,
            v => d3.sum(v, d => d.price),
            d => d.company
        );

        const dataArray = Array.from(aggregatedData, ([company, total]) => ({ company, total }));

        const x = d3.scaleBand()
            .domain(dataArray.map(d => d.company))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(dataArray, d => d.total)])
            .range([height, 0]);

        const chart = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        chart.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x));

        chart.append('g')
            .call(d3.axisLeft(y));

        chart.selectAll('.bar')
            .data(dataArray)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.company))
            .attr('y', d => y(d.total))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.total))
            .attr('fill', 'steelblue');
    };

    return (
        <div>
            <h2>Task {taskId} Visualizations</h2>
            <div>
                <label>Filter by Year (optional): </label>
                <input
                    type="number"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    placeholder="e.g., 2024"
                />
            </div>
            <h3>Sales Over Time (Line Chart)</h3>
            <svg ref={lineChartRef} width={600} height={400}></svg>
            <h3>Total Sales by Company (Bar Chart)</h3>
            <svg ref={barChartRef} width={600} height={400}></svg>
        </div>
    );
};

export default Visualizations;