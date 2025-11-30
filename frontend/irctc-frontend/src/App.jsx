import { useState, useEffect } from 'react';
import TrainConfig from './components/TrainConfig';
import Credentials from './components/Credentials';
import Travellers from './components/Travellers';

function App() {
  const [formData, setFormData] = useState({
    TRAIN_NO: '',
    TRAIN_COACH: 'SL',
    TRAVEL_DATE: '',
    SOURCE_STATION: '',
    BOARDING_STATION: '',
    DESTINATION_STATION: '',
    TATKAL: false,
    PREMIUM_TATKAL: false,
    UPI_ID_CONFIG: '@ybl',
    PASSENGER_DETAILS: [],
    USERNAME: '',
    PASSWORD: '',
    AUTOCAPTCHA: false,
  });

  // keep this: load once from backend on mount
  useEffect(() => {
    fetch('http://localhost:5000/config')
      .then(res => res.json())
      .then(data => {
        // merge with default in case backend empty
        setFormData(prev => ({ ...prev, ...data }));
      })
      .catch(() => { });
  }, []);

  // keep localStorage sync on change
  useEffect(() => {
    localStorage.setItem('trainConfig', JSON.stringify(formData));
  }, [formData]);

  const syncToBackend = async () => {
    try {
      const res = await fetch('http://localhost:5000/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),   // formData has PASSENGER_DETAILS, etc.
      });
      alert('Data saved on server.');
      const data = await res.json();
      console.log('Saved config to backend:', data);
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const [editingIndex, setEditingIndex] = useState(null);
  const [editingPassenger, setEditingPassenger] = useState({
    NAME: '',
    AGE: '',
    GENDER: 'Male',
    SEAT: 'Lower',
    FOOD: 'No Food',
  });

  useEffect(() => {
    const saved = localStorage.getItem('trainConfig');
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('trainConfig', JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const addPassenger = () => {
    if (formData.PASSENGER_DETAILS.length >= 4) return;
    setEditingIndex(formData.PASSENGER_DETAILS.length);
    setEditingPassenger({
      NAME: '',
      AGE: '',
      GENDER: 'Male',
      SEAT: 'Lower',
      FOOD: 'No Food',
    });
  };

  const startEditPassenger = index => {
    setEditingIndex(index);
    setEditingPassenger(formData.PASSENGER_DETAILS[index]);
  };

  const cancelEditPassenger = () => {
    setEditingIndex(null);
  };

  const savePassenger = () => {
    setFormData(prev => {
      const copy = [...prev.PASSENGER_DETAILS];
      if (editingIndex === copy.length) {
        copy.push(editingPassenger);
      } else {
        copy[editingIndex] = editingPassenger;
      }
      return { ...prev, PASSENGER_DETAILS: copy };
    });
    setEditingIndex(null);
  };

  const removePassenger = index => {
    setFormData(prev => ({
      ...prev,
      PASSENGER_DETAILS: prev.PASSENGER_DETAILS.filter((_, i) => i !== index),
    }));
    if (editingIndex === index) setEditingIndex(null);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    navigator.clipboard.writeText(dataStr);
    alert('Config copied to clipboard for automation.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black p-12">
      <div className="max-w-6xl mx-auto bg-black/80 backdrop-blur-xl shadow-3xl border border-purple-500/50 rounded-3xl p-12 text-white">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent mb-4">
            Automation Setup
          </h1>
        </div>

        <TrainConfig formData={formData} updateFormData={updateFormData} />

        <Credentials formData={formData} updateFormData={updateFormData} />

        <Travellers
          passengers={formData.PASSENGER_DETAILS}
          addPassenger={addPassenger}
          removePassenger={removePassenger}
          startEditPassenger={startEditPassenger}
          editingIndex={editingIndex}
          editingPassenger={editingPassenger}
          setEditingPassenger={setEditingPassenger}
          savePassenger={savePassenger}
          cancelEditPassenger={cancelEditPassenger}
        />

        <button
          onClick={syncToBackend}
          className="w-full p-6 bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-black text-xl font-black rounded-3xl hover:from-purple-500 hover:via-pink-500 hover:to-yellow-400 shadow-2xl mt-10 border-4 border-purple-500/30 transition-all"
        >
          Save config to server
        </button>
      </div>
    </div>
  );
}

export default App;
