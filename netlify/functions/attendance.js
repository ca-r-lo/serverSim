// Import necessary modules
const { Handler } = require('@netlify/functions');

// Sample data for demonstration purposes
let attendanceRecords = [];
let sections = [];
let students = [];

// Utility to handle API responses
const response = (statusCode, body) => ({
    statusCode,
    body: JSON.stringify(body),
});

// Handlers for each endpoint
const attendanceHandler = async (event) => {
    const { httpMethod, queryStringParameters, body } = event;

    if (httpMethod === 'GET') {
        const { date, section } = queryStringParameters || {};
        let results = attendanceRecords;
        if (date) {
            results = results.filter(record => record.date === date);
        }
        if (section) {
            results = results.filter(record => record.section === section);
        }
        return response(200, results);
    }

    if (httpMethod === 'POST') {
        const { student_id, status, time } = JSON.parse(body);
        attendanceRecords.push({ id: attendanceRecords.length + 1, student_id, status, time });
        return response(200, { message: "Attendance marked successfully" });
    }

    return response(405, { message: "Method Not Allowed" });
};

const dashboardHandler = async () => {
    return response(200, {
        stats: [
            { label: "Total Students", value: students.length.toString(), id: 1 },
            { label: "Total Sections", value: sections.length.toString(), id: 2 },
            { label: "Total Attendance Records", value: attendanceRecords.length.toString(), id: 3 }
        ]
    });
};

const reportsHandler = async () => {
    const reports = attendanceRecords.map(record => ({
        id: record.id,
        date: record.date,
        present: 10, // Example values
        absent: 5,
        late: 2,
        total: 17,
        status: record.status
    }));
    return response(200, reports);
};

const statsHandler = async () => {
    return response(200, {
        average_attendance: 85,
        daily_average: 20,
        chronic_absences: 3
    });
};

const sectionsHandler = async (event) => {
    const { httpMethod, body } = event;

    if (httpMethod === 'GET') {
        return response(200, { sections });
    }

    if (httpMethod === 'POST') {
        const { name, gradeLevel } = JSON.parse(body);
        const newSection = { id: sections.length + 1, name, gradeLevel };
        sections.push(newSection);
        return response(200, { ...newSection, message: "Section registered successfully" });
    }

    return response(405, { message: "Method Not Allowed" });
};

const studentsHandler = async (event) => {
    const { httpMethod, queryStringParameters, body } = event;

    if (httpMethod === 'GET') {
        const { section } = queryStringParameters || {};
        let results = students;
        if (section) {
            results = results.filter(student => student.section.name === section);
        }
        return response(200, { students: results });
    }

    if (httpMethod === 'POST') {
        const { firstName, middleName, lastName, age, lrn, sectionId } = JSON.parse(body);
        const section = sections.find(sec => sec.id === sectionId);
        if (!section) {
            return response(400, { message: "Invalid section ID" });
        }
        const newStudent = { id: students.length + 1, firstName, middleName, lastName, age, lrn, section };
        students.push(newStudent);
        return response(200, { ...newStudent, message: "Student registered successfully" });
    }

    return response(405, { message: "Method Not Allowed" });
};

// Netlify Function Handlers Export
exports.handler = async (event, context) => {
    const { path } = event;

    if (path === '/api/attendance') return attendanceHandler(event);
    if (path === '/api/dashboard') return dashboardHandler(event);
    if (path === '/api/reports') return reportsHandler(event);
    if (path === '/api/stats') return statsHandler(event);
    if (path === '/api/sections') return sectionsHandler(event);
    if (path === '/api/students') return studentsHandler(event);

    return response(404, { message: "Endpoint Not Found" });
};
