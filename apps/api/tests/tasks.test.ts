import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/server";

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
