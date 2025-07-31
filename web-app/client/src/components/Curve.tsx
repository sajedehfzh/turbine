import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
} from 'recharts';
import { fetchData } from '../lib/api';

interface TurbineData {
  timestamp: string;
  Wind: number;
  Leistung: number;
  Rotor: number;
  [key: string]: any;
}

const PowerCurve: React.FC = () => {
  const [turbineId, setTurbineId] = useState('turbine1');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [data, setData] = useState<TurbineData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDataAndUpdate();
  }, [turbineId, startDate, endDate]);

  const fetchDataAndUpdate = async () => {
    if (!startDate || !endDate) return;

    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      setData([]); // Clear data when there's an error
      return;
    }
    
    setError(null); // Clear previous errors

    try {
      debugger;
      const result = await fetchData(turbineId, startDate, endDate);
      debugger;
      setData(result);
    } catch (error: any) {
      debugger;
      console.error('Error fetching data:', error);
      setError(error.message);
    }
  };

  return (
    <div>
      <h2>Power Curve</h2>
      <div>
        <label>
          Turbine ID:
          <select value={turbineId} onChange={(e) => setTurbineId(e.target.value)}>
            <option value="turbine1">Turbine 1</option>
            <option value="turbine2">Turbine 2</option>
          </select>
        </label>
        <label>
          Start Date:
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </label>
        <label>
          End Date:
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            dateFormat="yyyy-MM-dd HH:mm"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
          />
        </label>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 40,
            bottom: 20,
            left: 90,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Wind" type="number" name="Wind Speed (m/s)" unit=" m/s" label={{ value: "Wind Speed (m/s)", position: "insideBottom", offset: -10 }} />
          <YAxis dataKey="Leistung" name="Power (kW)" unit=" kW" label={{ value: "Power (kW)", angle: -90, position: "insideLeft", offset: -60 }} tickMargin={10} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Turbine Data" dataKey="Leistung" fill="red" />
          <Legend align="left" wrapperStyle={{ paddingLeft: "90px", paddingTop: "5px" }}/>
        </ComposedChart>
      </ResponsiveContainer>

      {/* New Charts */}
      <h3>Rotor Control</h3>

      {/* (Wind, Rotor) */}
      <h4>Wind vs. Rotor</h4>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 90 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Wind" type="number" name="Wind Speed (m/s)" unit=" m/s" label={{ value: "Wind Speed (m/s)", position: "insideBottom", offset: -10 }} />
          <YAxis dataKey="Rotor" name="Rotor Speed (rpm)" unit=" rpm" label={{ value: "Rotor Speed (rpm)", angle: -90, position: "insideLeft", offset: -60 }} tickMargin={10} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Wind vs. Rotor" dataKey="Rotor" fill="blue" />
          <Legend align="left" wrapperStyle={{ paddingLeft: "90px", paddingTop: "5px" }}/>
        </ComposedChart>
      </ResponsiveContainer>

      {/* (Rotor, Leistung) */}
      <h4>Rotor vs. Power</h4>
      <ResponsiveContainer width="90%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 90 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Rotor" type="number" name="Rotor Speed (rpm)" unit=" rpm" label={{ value: "Rotor Speed (rpm)", position: "insideBottom", offset: -10 }} />
          <YAxis dataKey="Leistung" name="Power (kW)" unit=" kW" label={{ value: "Power (kW)", angle: -90, position: "insideLeft", offset: -60 }} tickMargin={10} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter name="Rotor vs. Power" dataKey="Leistung" fill="green" />
          <Legend align="left" wrapperStyle={{ paddingLeft: "90px", paddingTop: "5px" }}/>
        </ComposedChart>
      </ResponsiveContainer>

      {/* (Dat/Zeit, Leistung) */}
      <h4>Power over Time</h4>
      <ResponsiveContainer width="90%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 90 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" hide={true} />
          <YAxis dataKey="Leistung" name="Power (kW)" unit=" kW" label={{ value: "Power (kW)", angle: -90, position: "insideLeft", offset: -60 }} tickMargin={10} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Line type="monotone" dataKey="Leistung" stroke="#8884d8" name="Power" />
          <Legend align="left" wrapperStyle={{ paddingLeft: "90px", paddingTop: "5px" }}/>
        </LineChart>
      </ResponsiveContainer>

      {/* (Dat/Zeit, Rotor) */}
      <h4>Rotor Speed over Time</h4>
      <ResponsiveContainer width="90%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 90 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" hide={true} />
          <YAxis dataKey="Rotor" name="Rotor Speed (rpm)" unit=" rpm" label={{ value: "Rotor Speed (rpm)", angle: -90, position: "insideLeft", offset: -60 }} tickMargin={10} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Line type="monotone" dataKey="Rotor" stroke="#82ca9d" name="Rotor Speed" />
          <Legend align="left" wrapperStyle={{ paddingLeft: "90px", paddingTop: "5px" }}/>
        </LineChart>
      </ResponsiveContainer>

      {/* (Dat/Zeit, Wind) */}
      <h4>Wind Speed over Time</h4>
      <ResponsiveContainer width="90%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 90 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" hide={true} />
          <YAxis dataKey="Wind" name="Wind Speed (m/s)" unit=" m/s" label={{ value: "Wind Speed (m/s)", angle: -90, position: "insideLeft", offset: -60 }} tickMargin={10} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Line type="monotone" dataKey="Wind" stroke="#ffc658" name="Wind Speed" />
          <Legend align="left" wrapperStyle={{ paddingLeft: "90px", paddingTop: "5px" }}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PowerCurve;
