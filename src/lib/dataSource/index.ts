import { MockDataSource } from "./MockDataSource"
import type { DataSource } from "./types"
// import { ApiDataSource } from "./ApiDataSource"; // teammate adds this later

export const dataSource: DataSource = new MockDataSource()
// To swap later: export const dataSource: DataSource = new ApiDataSource("http://pi.local:8000");
