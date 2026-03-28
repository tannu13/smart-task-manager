import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/server";
import db from "../src/db/connection";
import { tasks } from "../src/db/schema";

describe("POST /tasks", () => {
  it("should create & return a new task and 201 status", async () => {
    const newTitle = "Task Test 1";
    const response = await request(app).post("/tasks").send({
      title: newTitle,
    });

    expect(response.status).toBe(201);
    const newTask = response.body.data.task;
    expect(newTask).toMatchObject({
      title: newTitle,
      id: expect.any(String),
      isCompleted: false,
      createdAt: expect.any(String),
    });
  });

  it("should return 400 status code if title is missing", async () => {
    const response = await request(app).post("/tasks").send({});

    expect(response.status).toBe(400);
  });

  it("should return 400 status code if title is only spaces", async () => {
    const response = await request(app).post("/tasks").send({ title: "    " });

    expect(response.status).toBe(400);
  });

  it("should trim the title and insert it in db", async () => {
    const newTitle = "  Task Test 2  ";
    const response = await request(app).post("/tasks").send({
      title: newTitle,
    });

    expect(response.status).toBe(201);
    const newTask = response.body.data.task;
    expect(newTask).toMatchObject({
      title: newTitle.trim(),
      id: expect.any(String),
      isCompleted: false,
      createdAt: expect.any(String),
    });
  });
});

describe("GET /tasks", () => {
  beforeEach(async () => {
    await db.delete(tasks);
  });
  it("should return empty array when no tasks exist", async () => {
    const response = await request(app).get("/tasks");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: { tasks: [] },
    });
  });
  it("should return the created 2 tasks", async () => {
    await db.insert(tasks).values([{ title: "Task 1" }, { title: "Task 2" }]);
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    expect(response.body.data.tasks).toHaveLength(2);
  });
  it("should return the newest first", async () => {
    await db.insert(tasks).values([{ title: "Task 1" }]);
    await db.insert(tasks).values([{ title: "Task 2" }]);
    const response = await request(app).get("/tasks");

    const firstTask = response.body.data.tasks[0];
    const secondTask = response.body.data.tasks[1];

    expect(response.status).toBe(200);
    expect(firstTask.title).toBe("Task 2");
    expect(secondTask.title).toBe("Task 1");
  });
});
