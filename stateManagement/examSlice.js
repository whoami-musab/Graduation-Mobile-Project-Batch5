import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const express_url = process.env.EXPO_PUBLIC_BACKEND_EXPRESS_URL;

const normalizeType = (t) => String(t || "").toLowerCase().trim();

// ===================== Make Exam =======================
export const make_exam = createAsyncThunk(
    "exam/makeExam",
    async (_, thunkAPI) => {
        try {
        const state = thunkAPI.getState();
        const token = state?.auth?.token;

        if (!token) return thunkAPI.rejectWithValue("Not authenticated.");

        const res = await fetch(`${express_url}/exam/make_exam`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        if (!res.ok) return thunkAPI.rejectWithValue(data?.message || "Failed to make exam");
        return data;
        } catch (error) {
        return thunkAPI.rejectWithValue(error?.message || "Failed to make exam");
        }
    }
    );

    // ===================== Save Exam to Database =======================
    // FormData: answers_json + start/end + audio_files (RN: {uri,name,type})
    export const save_exam = createAsyncThunk(
    "exam/saveExam",
    async (_, thunkAPI) => {
        try {
        const state = thunkAPI.getState();
        const token = state?.auth?.token;

        const { questions, studentAnswerByKey, startTime, speakingAudioByIndex } = state.exam || {};

        if (!token) return thunkAPI.rejectWithValue("Not authenticated.");
        if (!startTime) return thunkAPI.rejectWithValue("Exam not started (startTime missing).");

        const endTime = new Date().toISOString();

        const answers = (questions || []).map((q, index) => {
            const type = normalizeType(q?.type);
            const answerKey =
            type === "listening" && Number.isFinite(Number(q?.globalIndex))
                ? Number(q.globalIndex)
                : index;

            return {
            question: q?.question || "",
            std_answer: (studentAnswerByKey && studentAnswerByKey[answerKey]) ? studentAnswerByKey[answerKey] : "",
            type: q?.type,
            meta: {
                index,
                answerKey,
                audio_id: q?.audio_id || null,
                audio_url: q?.audio_url || null,
            },
            };
        });

        const formData = new FormData();
        formData.append("answers_json", JSON.stringify(answers));
        formData.append("answer_json", JSON.stringify(answers));
        formData.append("startTime", startTime);
        formData.append("endTime", endTime);

        // Attach speaking files
        (questions || []).forEach((q, index) => {
            if (normalizeType(q?.type) !== "speaking") return;

            const file = speakingAudioByIndex?.[index];
            if (!file?.uri) return;

            formData.append(
            "audio_files",
            {
                uri: file.uri,
                name: file.name || `speaking_${index}.m4a`,
                type: file.type || "audio/m4a",
            }
            );
        });

        const res = await fetch(`${express_url}/exam/aiAnalyze`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) return thunkAPI.rejectWithValue(data?.message || "Unknown error occurred. Please try again");

        return data;
        } catch (error) {
        return thunkAPI.rejectWithValue(error?.message || "Failed to save exam data");
        }
    }
    );

    // ===================== Get Exams =======================
    export const get_exams = createAsyncThunk(
    "exam/getExams",
    async (_, thunkAPI) => {
        try {
        const state = thunkAPI.getState();
        const token = state?.auth?.token;

        if (!token) return thunkAPI.rejectWithValue("Not authenticated.");

        const res = await fetch(`${express_url}/exam/getExams`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        if (!res.ok) return thunkAPI.rejectWithValue(data?.message || "Failed to get exams");
        return data;
        } catch (error) {
        return thunkAPI.rejectWithValue(error?.message || "Failed to get exams");
        }
    }
    );

    // ===================== Get Exam Details =======================
    export const get_exam_details = createAsyncThunk(
    "exam/getExamDetails",
    async (examId, thunkAPI) => {
        try {
        const state = thunkAPI.getState();
        const token = state?.auth?.token;

        if (!token) return thunkAPI.rejectWithValue("Not authenticated.");

        const res = await fetch(`${express_url}/exam/getExam/${examId}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();
        if (!res.ok) return thunkAPI.rejectWithValue(data?.message || "Failed to get exam details");
        return data;
        } catch (error) {
        return thunkAPI.rejectWithValue(error?.message || "Failed to get exam details");
        }
    }
    );

    const examSlice = createSlice({
    name: "exam",
    initialState: {
        speakingAudioByIndex: {},
        getExamDetails: null,
        oldExams: [],
        examData: null,
        userId: null,
        questions: [],
        currentIndex: 0,
        // object key => answer (يدعم listening globalIndex)
        studentAnswerByKey: {},
        startTime: null,
        started: false,
        loading: false,
        error: null,
    },
    reducers: {
        nextQuestion: (state) => {
            if (state.currentIndex < state.questions.length - 1) {
                state.currentIndex += 1;
            }
        },
        previousQuestion: (state) => {
            if (state.currentIndex > 0) state.currentIndex -= 1;
        },
        saveSpeakingAudio: (state, action) => {
            const { index, file } = action.payload || {};
            if (index === undefined) return;
            state.speakingAudioByIndex[index] = file;
        },
        saveAnswer: (state, action) => {
            const payload = action.payload ?? {};
            const idx = payload.index;

            if (idx === undefined || idx === null) return;

            // توحيد المفتاح (string) عشان ما تعمل "1" و 1 كمفتاحين مختلفين
            const key = String(idx);

            // تأكد من ان المفتاح موجود
            if (!state.studentAnswerByKey) state.studentAnswerByKey = {};

            //نخليه '' بدل  undefined عشان الـ TextInput ما يمسح الكلام
            state.studentAnswerByKey[key] = payload.answer ?? '';
        },
        startExam: (state) => {
            state.started = true;
            state.startTime = new Date().toISOString();
        },
        resetExam: (state) => {
            state.examData = null;
            state.questions = [];
            state.currentIndex = 0;
            state.studentAnswerByKey = {};
            state.speakingAudioByIndex = {};
            state.startTime = null;
            state.started = false;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
        // Make Exam
        .addCase(make_exam.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(make_exam.fulfilled, (state, action) => {
            state.loading = false;
            state.questions = action.payload || [];
        })
        .addCase(make_exam.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Save Exam
        .addCase(save_exam.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(save_exam.fulfilled, (state, action) => {
            state.loading = false;
            state.examData = action.payload;
        })
        .addCase(save_exam.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Get Exams
        .addCase(get_exams.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(get_exams.fulfilled, (state, action) => {
            state.loading = false;
            state.oldExams = action.payload?.exams || [];
        })
        .addCase(get_exams.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })

        // Get Exam Details
        .addCase(get_exam_details.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(get_exam_details.fulfilled, (state, action) => {
            state.loading = false;
            state.getExamDetails = action.payload?.exam || null;
        })
        .addCase(get_exam_details.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export const {
    nextQuestion,
    previousQuestion,
    saveAnswer,
    startExam,
    resetExam,
    saveSpeakingAudio,
} = examSlice.actions;

export default examSlice.reducer;