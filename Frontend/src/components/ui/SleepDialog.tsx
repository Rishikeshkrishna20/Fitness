import React, { useState } from 'react';

interface SleepDialogProps {
  onClose: () => void;
}

const SleepDialog: React.FC<SleepDialogProps> = ({ onClose }) => {
  const [hoursSlept, setHoursSlept] = useState<number | ''>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // today's date

  const handleSubmit = () => {
    if (!hoursSlept) {
      alert('Please enter how many hours you slept.');
      return;
    }

    // Replace this with your actual API call or logic
    console.log(`Date: ${date}, Hours Slept: ${hoursSlept}`);
    alert(`Submitted sleep data:\nDate: ${date}\nHours: ${hoursSlept}`);

    // Close dialog
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Sleep Entry</h2>

        <div className="mb-4">
          <label className="block mb-1 font-medium">How many hours did you sleep?</label>
          <input
            type="number"
            min="0"
            max="24"
            value={hoursSlept}
            onChange={(e) => setHoursSlept(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="w-full px-3 py-2 border rounded"
            placeholder="e.g., 7.5"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SleepDialog;
