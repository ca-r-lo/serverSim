// Import necessary modules
const { Handler } = require('@netlify/functions');

// Sample data for demonstration purposes
// Sample data for demonstration purposes
const sections = [
    { id: 1, name: "Grade 7-A", gradeLevel: 7 },
    { id: 2, name: "Grade 7-B", gradeLevel: 7 },
    { id: 3, name: "Grade 8-A", gradeLevel: 8 },
    { id: 4, name: "Grade 8-B", gradeLevel: 8 },
    { id: 5, name: "Grade 9-A", gradeLevel: 9 }
];

const students = [
    { 
        id: 1, 
        firstName: "John", 
        middleName: "Michael", 
        lastName: "Smith", 
        age: 13, 
        lrn: "123456789012", 
        section: sections[0]
    },
    { 
        id: 2, 
        firstName: "Emma", 
        middleName: "Rose", 
        lastName: "Johnson", 
        age: 13, 
        lrn: "123456789013", 
        section: sections[0]
    },
    { 
        id: 3, 
        firstName: "James", 
        middleName: "Peter", 
        lastName: "Williams", 
        age: 14, 
        lrn: "123456789014", 
        section: sections[1]
    },
    { 
        id: 4, 
        firstName: "Sophia", 
        middleName: "Grace", 
        lastName: "Brown", 
        age: 14, 
        lrn: "123456789015", 
        section: sections[1]
    },
    { 
        id: 5, 
        firstName: "Oliver", 
        middleName: "Thomas", 
        lastName: "Davis", 
        age: 15, 
        lrn: "123456789016", 
        section: sections[2]
    }
];

const attendanceRecords = [
    {
        id: 1,
        student_id: 1,
        date: "2024-03-25",
        status: "PRESENT",
        time: "07:45:00",
        section: sections[0].name
    },
    {
        id: 2,
        student_id: 2,
        date: "2024-03-25",
        status: "LATE",
        time: "08:15:00",
        section: sections[0].name
    },
    {
        id: 3,
        student_id: 3,
        date: "2024-03-25",
        status: "ABSENT",
        time: null,
        section: sections[1].name
    },
    {
        id: 4,
        student_id: 1,
        date: "2024-03-26",
        status: "PRESENT",
        time: "07:50:00",
        section: sections[0].name
    },
    {
        id: 5,
        student_id: 2,
        date: "2024-03-26",
        status: "PRESENT",
        time: "07:55:00",
        section: sections[0].name
    },
    {
        id: 6,
        student_id: 4,
        date: "2024-03-26",
        status: "EXCUSED",
        time: null,
        section: sections[1].name
    },
    {
        id: 7,
        student_id: 5,
        date: "2024-03-26",
        status: "PRESENT",
        time: "07:45:00",
        section: sections[2].name
    }
];

// Utility to handle API responses
const response = (statusCode, body) => ({
    statusCode,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://amspcnhs.netlify.app', // Allow requests from the frontend
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',  // Allow methods
        'Access-Control-Allow-Headers': 'Content-Type' // Allow specific headers
    },
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

const healthHandler = async () => {
    return response(200, {
        connection_status: "success"
    });
};

const loginHandler = async (event) => {
    const { httpMethod, body } = event;

    if (httpMethod === 'POST') {
        const { username, password } = JSON.parse(body);
        const user = "ubelo";
        const pass = "123123";

        if (username === user && password === pass) { 
            return response(200, {
                "token": "string",
                "user": {
                    "id": "1",
                    "username": user,
                    "role": "admin"
                }
            });
        } else {
            return response(401, { message: "Invalid credentials" });
        }
    }

    return response(405, { message: "Method Not Allowed" });
};


const optionsHandler = () => {
    return {
        statusCode: 204, // No content
        headers: {
            'Access-Control-Allow-Origin': 'https://amspcnhs.netlify.app',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    };
};


// Modify the exports.handler to include the OPTIONS method
exports.handler = async (event, context) => {
    const { path, httpMethod } = event;

    // Handle preflight CORS requests
    if (httpMethod === 'OPTIONS') {
        return optionsHandler();
    }

    if (path === '/api/attendance') return attendanceHandler(event);
    if (path === '/api/dashboard') return dashboardHandler(event);
    if (path === '/api/reports') return reportsHandler(event);
    if (path === '/api/stats') return statsHandler(event);
    if (path === '/api/sections') return sectionsHandler(event);
    if (path === '/api/students') return studentsHandler(event);
    if (path === '/api/health') return healthHandler(event);
    if (path === '/api/auth/login') return loginHandler(event);

    return response(404, { message: "Endpoint Not Found" });
};
