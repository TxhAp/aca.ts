/// <reference types="../types" />

import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { checkApps } from '../libs/common'

const stringType = 'varchar(768)'
const create = ' default current_timestamp'
const update = ' default current_timestamp on update current_timestamp'

const keywords = {
  pg: {
    fullName: 'pg',
    quote: { prefix: '"', name: '"', value: "'" },
    idDefaultType: 'cuid',
    idType: {
      autoincrement: { jsType: 'number', dbType: 'serial8' },
      cuid: { jsType: 'string', dbType: 'cuid' },
      uuid: { jsType: 'string', dbType: 'uuid' },
      string: { jsType: 'string', dbType: stringType },
      int: { jsType: 'number', dbType: 'int8' },
    },
    scalarType: {
      int: { jsType: 'number', dbType: 'int8' },
      object: { jsType: 'object', dbType: 'json' },
      float: { jsType: 'number', dbType: 'float8' },
      bigint: { jsType: 'bigint', dbType: 'bigint' },
      string: { jsType: 'string', dbType: stringType },
      boolean: { jsType: 'boolean', dbType: 'boolean' },
      Date: { jsType: 'Date', dbType: 'timestamp' },
    },
    dbType: {
      enum: 'varchar(30)',
      cuid: 'char(25)',
      uuid: 'uuid',
    },
    dbTypes: {
      boolean: ['boolean'],
      object: ['object'],
      float: ['decimal', 'float4', 'float8'],
      int: ['int2', 'int4', 'int8', 'money'],
      autoincrement: ['serial2', 'serial4', 'serial8'],
      Date: ['timestamp', 'date', 'time ', 'interval'],
      string: [],
    },
    timestamp: {
      create,
      update: create,
    },
    stmt: {
      primaryKey: ' primary key',
      autoincrement: '',
      unique: ' unique',
      index: '',
    },
  },
  mssql: {
    fullName: 'mssql',
    quote: { prefix: '`', name: '`', value: "'" },
    idDefaultType: 'cuid',
    idType: {
      autoincrement: { jsType: 'number', dbType: 'int' },
      cuid: { jsType: 'string', dbType: 'cuid' },
      uuid: { jsType: 'string', dbType: 'uuid' },
      string: { jsType: 'string', dbType: stringType },
      int: { jsType: 'number', dbType: 'int' },
    },
    scalarType: {
      int: { jsType: 'number', dbType: 'int' },
      object: { jsType: 'object', dbType: 'json' },
      float: { jsType: 'number', dbType: 'real' },
      bigint: { jsType: 'bigint', dbType: 'bigint' },
      string: { jsType: 'string', dbType: stringType },
      boolean: { jsType: 'boolean', dbType: 'boolean' },
      Date: { jsType: 'Date', dbType: 'timestamp' },
    },
    dbType: {
      enum: 'varchar(30)',
      cuid: 'char(25)',
      uuid: 'char(36)',
    },
    dbTypes: {
      boolean: ['boolean'],
      object: ['object'],
      float: ['decimal', 'float4', 'float8'],
      int: ['int2', 'int4', 'int8', 'money'],
      autoincrement: ['serial2', 'serial4', 'serial8'],
      Date: ['timestamp', 'date', 'time ', 'interval'],
      string: [],
    },
    timestamp: {
      create,
      update,
    },
    stmt: {
      primaryKey: ' primary key',
      autoincrement: ' identity',
      unique: ' unique',
      index: '',
    },
  },
  mysql: {
    fullName: 'mysql',
    quote: { prefix: '`', name: '`', value: "'" },
    idDefaultType: 'cuid',
    idType: {
      autoincrement: {
        jsType: 'number',
        dbType: 'int',
      },
      cuid: { jsType: 'string', dbType: 'cuid' },
      uuid: { jsType: 'string', dbType: 'uuid' },
      string: { jsType: 'string', dbType: 'varchar(200)' },
      int: { jsType: 'number', dbType: 'int' },
    },
    scalarType: {
      int: { jsType: 'number', dbType: 'int' },
      object: { jsType: 'object', dbType: 'json' },
      float: { jsType: 'number', dbType: 'float8' },
      bigint: { jsType: 'bigint', dbType: 'numeric' },
      string: { jsType: 'string', dbType: stringType },
      boolean: { jsType: 'boolean', dbType: 'boolean' },
      Date: { jsType: 'Date', dbType: 'timestamp' },
    },
    dbType: {
      enum: 'varchar(30)',
      cuid: 'char(25)',
      uuid: 'char(36)',
    },
    dbTypes: {
      boolean: ['boolean'],
      object: ['object'],
      float: ['decimal', 'float4', 'float8'],
      int: ['int2', 'int4', 'int8', 'money'],
      autoincrement: ['int'],
      Date: ['timestamp', 'date', 'time ', 'interval'],
      string: [],
    },
    timestamp: {
      create: create,
      update,
    },
    stmt: {
      primaryKey: ' primary key',
      autoincrement: ' auto_increment',
      unique: ' unique key',
      index: '',
    },
  },
  betterSqlite3: {
    fullName: 'better-sqlite3',
    quote: { prefix: '"', name: '"', value: "'" },
    idDefaultType: 'cuid',
    idType: {
      autoincrement: {
        jsType: 'number',
        dbType: 'integer',
      },
      cuid: { jsType: 'string', dbType: 'cuid' },
      uuid: { jsType: 'string', dbType: 'uuid' },
      string: { jsType: 'string', dbType: stringType },
      int: { jsType: 'number', dbType: 'integer' },
    },
    scalarType: {
      int: { jsType: 'number', dbType: 'integer' },
      object: { jsType: 'object', dbType: 'json' },
      float: { jsType: 'number', dbType: 'real' },
      bigint: { jsType: 'bigint', dbType: 'integer' },
      string: { jsType: 'string', dbType: stringType },
      boolean: { jsType: 'boolean', dbType: 'char(1)' },
      Date: { jsType: 'Date', dbType: 'timestamp' },
    },
    dbType: {
      enum: 'varchar(30)',
      cuid: 'char(25)',
      uuid: 'char(36)',
    },
    dbTypes: {
      boolean: ['char(1)'],
      object: ['text'],
      float: ['float', 'double', 'real'],
      int: ['integer', 'smallint'],
      autoincrement: ['integer'],
      Date: ['timestamp', 'date', 'time '],
      string: [],
    },
    timestamp: {
      create,
      update: '',
    },
    stmt: {
      primaryKey: ' primary key',
      autoincrement: ' autoincrement',
      unique: ' unique',
      index: '',
    },
  },
}

export default function (driver: Driver) {
  if (!Object.keys(keywords).includes(driver))
    throw new Error(`数据库驱动程序不支持：${driver}`)
  const keyword = keywords[driver]
  const qPrefix = keyword.quote.prefix
  const qName = keyword.quote.name
  const qValue = keyword.quote.value

  return {
    keyword,
    db: {
      exist(dbName: string) {
        // 是否存在数据库
        return {
          pg: ` SELECT * FROM pg_database WHERE datname = ${qPrefix}${dbName}${qName}`,
        }[driver]
      },
      all() {
        // 查找所有的表
        return {
          pg: `SELECT tablename FROM pg_tables
          WHERE tablename NOT LIKE 'pg_%'
          AND tablename NOT LIKE 'sql_%'
          ORDER BY tablename`,
        }[driver]
      },
      create(dbName: string) {
        return `CREATE DATABASE ${qPrefix}${dbName}${qName}${
          driver === 'pg' ? ' template=template0' : ''
        }`
      },
      drop(dbName: string) {
        return `DROP DATABASE ${qPrefix}${dbName}${qName}${
          driver === 'pg' ? 'template=template0' : ''
        }`
      },
      rename(dbName: string) {
        return `RENAME DATABASE ${qPrefix}${dbName}${qName}`
      },
      async connection(
        acaDir: AcaDir,
        config: Config,
        opts: string | RelConn | SqliteConn
      ) {
        const resolveAcaDir = path.resolve(acaDir)
        const app = Object.keys(config.serverApps)[0]
        let db
        switch (driver) {
          case 'pg':
            if (typeof opts === 'string') {
              const connStr = path.join(
                resolveAcaDir,
                app,
                'node_modules/pg-connection-string'
              )
              opts = require(connStr).parse(opts)
            }
            let Db = require(path.join(
              resolveAcaDir,
              app,
              'node_modules/pg'
            )).Client
            db = new Db(opts)
            try {
              await db.connect()
            } catch (e) {
              db = new Db({
                ...(<RelConn>opts),
                database: 'postgres',
              })
              await db.connect()
            }

            return db
          case 'mysql':
            const mysql = require(path.join(
              resolveAcaDir,
              app,
              'node_modules/mysql'
            ))
            db = mysql.createConnection(opts)

            try {
              const conn = promisify((cb) => db.connect(cb))
              await conn()
            } catch (e) {
              db = mysql.createConnection({
                ...(<RelConn>opts),
                database: undefined,
              })
              const conn = promisify((cb) => db.connect(cb))
              await conn()
            }

            return db

          case 'betterSqlite3':
            db = require(path.join(
              resolveAcaDir,
              app,
              'node_modules/better-sqlite3'
            ))
            const dbName = path.join(
              resolveAcaDir,
              app,
              (<SqliteConn>opts).filename
            )
            return fs.existsSync(dbName)
              ? new db(dbName, {
                  ...(<SqliteConn>opts),
                  filename: undefined,
                })
              : null
        }
      },
      createSqliteDb(acaDir: AcaDir, config: Config, option: SqliteConn) {
        const resolveAcaDir = path.resolve(acaDir)
        // 剔除已经删除的应用
        checkApps(acaDir, config)
        const apps = Object.keys(config.serverApps)

        if (apps.length !== 1) {
          throw new Error(`含有sqlite文件型数据库的后端应用只能创建一个`)
        }
        const db = require(path.join(
          resolveAcaDir,
          apps[0],
          'node_modules/better-sqlite3'
        ))
        const filename = path.join(resolveAcaDir, apps[0], option.filename)

        return new db(filename, {
          ...(<SqliteConn>option),
          filename: undefined,
        })
      },
    },
    tbl(table: string) {
      const consPre = {
        pg: (action: 'ADD' | 'DROP') =>
          `ALTER TABLE ${qPrefix}${table}${qName} ${action} `,
        mysql: (action: 'ADD' | 'DROP') =>
          `ALTER TABLE ${qPrefix}${table}${qName} ${action} `,
        betterSqlite3: (action: 'ADD' | 'DROP') => '',
      }[driver]

      return {
        exist() {},
        all() {
          return {
            pg: `select * from information_schema.columns
              where table_schema = 'public' and table_name='${table}'`,
          }[driver]
        },
        create(sql: string) {
          return `CREATE TABLE ${qPrefix}${table}${qName} (\n${sql})`
        },
        drop() {
          return `DROP TABLE ${qPrefix}${table}${qName}`
        },
        rename(newName: string) {
          return `ALTER TABLE ${qPrefix}${table}${qName} RENAME TO ${qName}${newName}${qName}`
        },
        mutate: {
          add(columns: AddColumn | AddColumn[]) {
            if (!Array.isArray(columns)) columns = [columns]
            const cols = columns
              .map(
                (v) =>
                  `ADD COLUMN ${qName}${
                    v.name
                  }${qName} ${v.dbType.toUpperCase()}${
                    v.notNull ? ' NOT NULL' : ''
                  }`
              )
              .join(', ')

            return `ALTER TABLE ${qPrefix}${table}${qName} ${cols}`
          },
          drop(columns: string | string[]) {
            if (!Array.isArray(columns)) columns = [columns]
            return `ALTER TABLE ${qPrefix}${table}${qName} ${columns
              .map((v) => `DROP COLUMN ${qName}${v}${qName}`)
              .join(', ')}`
          },
          alter(column: string) {
            return {
              rename(newCol: string) {
                return `ALTER TABLE ${qPrefix}${table}${qName} RENAME ${qName}${column}${qName} TO ${qName}${newCol}${qName}`
              },
              type(dbName: string) {
                return `ALTER TABLE ${qPrefix}${table}${qName} ALTER COLUMN ${qName}${column}${qName} TYPE ${qName}${dbName}${qName}`
              },
              notNull(action: 'SET' | 'DROP') {
                return `ALTER TABLE ${qPrefix}${table}${qName} ALTER COLUMN ${qName}${column}${qName} ${action} NOT NULL`
              },
              check(value?: string) {
                return `ALTER TABLE ${qPrefix}${table}${qName} ALTER COLUMN ${qName}${column}${qName} ${
                  value !== undefined
                    ? `SET CHECK ${qValue}${value}${qValue}`
                    : 'DROP CHECK'
                }`
              },
              default(value?: string) {
                return `ALTER TABLE ${qPrefix}${table}${qName} ALTER COLUMN ${qName}${column}${qName} ${
                  value !== undefined ? `SET DEFAULT ${value}` : 'DROP DEFAULT'
                }`
              },
            }
          },
        },
        // 表约束
        constraint: {
          find(type: 'UNIQUE' | 'CHECK' | 'PRIMARY KEY' | 'FOREIGN KEY') {
            return {
              pg: `SELECT
              tc.constraint_name, tc.table_name, kcu.column_name,
              ccu.table_name AS foreign_table_name,
              ccu.column_name AS foreign_column_name,
              tc.is_deferrable,tc.initially_deferred
              FROM 
              information_schema.table_constraints AS tc 
              JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
              JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
              WHERE constraint_type = '${type}' AND tc.table_name = '${table}'`,
            }[driver]
          },
          foreign(action: 'ADD' | 'DROP', foreign: Foreign, relTbl: Table) {
            return `${consPre(
              action
            )}CONSTRAINT ${qName}FOREIGN_${table}_${foreign.keys.join(
              '_'
            )}${qName} FOREIGN KEY (${foreign.keys
              .map((v) => `${qName}${v}${qName}`)
              .toString()}) REFERENCES ${qName}${
              relTbl.dbName
            }${qName} (${foreign.references
              .map((v) => relTbl.columns[v].dbName)
              .map((v) => `${qName}${v}${qName}`)
              .toString()})${
              foreign.onUpdate ? ` on update ${foreign.onUpdate}` : ''
            }${foreign?.onDelete ? ` on delete ${foreign.onDelete}` : ''}`
          },
          unique(action: 'ADD' | 'DROP', columns: string | string[]) {
            if (typeof columns === 'string') columns = [columns]
            const key = columns.join('_')
            const quoteCols = `${columns
              .map((v) => `${qName}${v}${qName}`)
              .toString()}`

            return `${consPre(
              action
            )}CONSTRAINT ${qName}UNIQUE_${table}_${key}${qName}${
              action === 'ADD' ? ` UNIQUE (${quoteCols})` : ''
            }`
          },
          index(action: 'CREATE' | 'DROP', columns: string | string[]) {
            const key =
              typeof columns === 'string' ? columns : columns.join('_')
            let quoteCols = `${qName}${columns}${qName}`
            quoteCols =
              typeof columns === 'string' ? quoteCols : quoteCols.toString()
            return `${action} INDEX ${qName}INDEX_${table}_${key}${qName}${
              action === 'CREATE'
                ? ` ON ${qName}${table}${qName} (${quoteCols})`
                : ''
            }`
          },
        },
      }
    },
    view(view: string) {
      return {
        async all() {},
        async create() {},
        async drop() {},
        async rename() {},
        async alter() {
          return {
            async all() {},
            async exist(column: string) {},
            async create(column: string) {},
            async drop(column: string) {},
            async rename(column: string) {},
            async alter(column: string) {},
          }
        },
      }
    },
    aca: {
      create: `\nCREATE TABLE ${qPrefix}___ACA${qName} (${qName}version${qName} varchar(18) PRIMARY KEY, ${qName}preverison${qName} varchar(18), ${qName}status${qName} boolean DEFAULT true, ${qName}orm${qName} text, ${qName}createdAt${qName} timestamp DEFAULT CURRENT_TIMESTAMP);\n`,
      insert: (version, orm?) =>
        `\nINSERT INTO ${qPrefix}___ACA${qName} (${qName}version${qName}, ${qName}orm${qName}) VALUES (${qValue}${version}${qValue}, ${qValue}${
          orm || ''
        }${qValue});\n`,
      select: `\nSELECT * FROM ${qPrefix}___ACA${qName} WHERE ${qName}status${qName} = true order by ${qName}createdAt${qName} desc limit 1;\n`,
    },
  }
}