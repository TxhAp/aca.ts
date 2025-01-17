const Insert = (Tb, X) => `{[K in keyof Omit<$TB[${Tb}], ${X} | $Auto<${Tb}>>]: Omit<$TB[${Tb}], ${X} | $Auto<${Tb}>>[K]}`

const Update = (Tb, X, S) => `
{
  [K in Exclude<
    keyof $TB[${Tb}],
    (${S} extends 'M2M' ? never : ${X}) | $Auto<${Tb}>
  >]?: NonNullable<$TB[${Tb}][K]> extends $Relation<infer R, infer R2, infer R3>
    ? NonNullable<$TB[${Tb}][K]> extends $Relation<never, never, never>
      ? $TB[${Tb}][K]
      : 'toOne' extends R3
      ? Omit<
          $UpdateToOne<R, R2, R3>,
          undefined extends $TB[${Tb}][K]
            ? never
            :
                | 'upsert'
                | ('toOne' extends ${S}
                    ? undefined extends $TB[R][R2]
                      ? 'disconnect'
                      : never
                    : never)
        >
      : $UpdateToMany<R, R2, R3>
    : number extends $TB[${Tb}][K]
    ?
        | $TB[${Tb}][K]
        | {
            increment?: number
            decrement?: number
          }
    : $TB[${Tb}][K]
}
`
const UpdateMany = (Tb) => `
{
  [K in keyof Pick<
    $TB[${Tb}],
    Exclude<$ScalarColumns<${Tb}>, $Auto<${Tb}>>
  >]?: number extends Pick<$TB[${Tb}], $ScalarColumns<${Tb}>>[K]
    ?
        | Pick<$TB[${Tb}], $ScalarColumns<${Tb}>>[K]
        | {
            increment?: number
            decrement?: number
          }
    : Pick<$TB[${Tb}], $ScalarColumns<${Tb}>>[K]
}
`
const Select = (Tb, X, S) => `
| {
  '*'?: true
} & {
  [K in keyof Omit<$TB[${Tb}], ${S} extends 'M2M' ? never : ${X}>]?: NonNullable<
    $TB[${Tb}][K]
  > extends $Relation<infer R, infer R2, infer R3>
    ? NonNullable<$TB[${Tb}][K]> extends $Relation<never, never, never>
      ? true
      :
          | $Select<R, R2, R3>
          | ('toOne' extends R3
              ? {
                  select?: $Select<R, R2, R3>
                }
              : $FindMany<R, R2, R3>)
    : true
}
`

module.exports = `\n
type $Enums = keyof $EnumType

type $Enumerable<T> = T | Array<T>

type $Order = 'asc' | 'desc'

type $WhereLogic = 'AND' | 'OR' | 'NOT'

type $ToManyFilter = 'every' | 'some' | 'none'

type $RelationSign = 'toOne' | 'toMany' | 'M2M'

const $FindQuery = {
  findOne: true,
  findFirst: true,
  findMany: true,
}

const $AggregateQuery = {
  count: true,
  countDistinct: true,
  sum: true,
  sumDistinct: true,
  avg: true,
  avgDistinct: true,
  max: true,
  mix: true,
}

const $MutationQuery = {
  insert: true,
  upsert: true,
  update: true,
  updateMany: true,
  delete: true,
  deleteMany: true,
}

type $FindQuery = keyof typeof $FindQuery
type $AggregateQuery = keyof typeof $AggregateQuery
type $MutationQuery = keyof typeof $MutationQuery

// omit key's never type
type $OmitNever<T> = Pick<
  T,
  {
    [K in keyof Required<T>]: Required<T>[K] extends never ? never : K
  }[keyof T]
>

type $Auto<Tb extends keyof $TB> = $FK[Tb] | $CU[Tb]

type $Relation<
  Tb extends keyof $TB,
  X extends Exclude<keyof $TB[Tb], $ScalarColumns<Tb>>,
  S extends $RelationSign
> =
  | {
    insert: S extends 'toOne'
    ? ${Insert('Tb', 'X')}
      :
        | ${Insert('Tb', "(S extends 'M2M' ? never : X)")}
        | ${Insert('Tb', "(S extends 'M2M' ? never : X)")}[]
}
| {
  connect: S extends 'toOne'
        ? undefined extends $TB[Tb][X]
          ? $UN[Tb]
          : never
        : $UN[Tb] | $UN[Tb][]
    }

type $ScalarColumns<Tb extends keyof $TB> = NonNullable<
  {
    [K in keyof $TB[Tb]]: NonNullable<$TB[Tb][K]> extends $Relation<
      any,
      any,
      any
    >
      ? never
      : K
  }[keyof $TB[Tb]]
>

type $SimpleScalarColumns<Tb extends keyof $TB> = {
  [K in $ScalarColumns<Tb>]: NonNullable<$TB[Tb][K]> extends
    | boolean
    | number
    | bigint
    | Date
    | string
    ? K
    : never
}[$ScalarColumns<Tb>]

type $ArrayScalarColumns<Tb extends keyof $TB> = {
  [K in $ScalarColumns<Tb>]: NonNullable<$TB[Tb][K]> extends any[] ? K : never
}[$ScalarColumns<Tb>]

type $JsonScalarColumns<Tb extends keyof $TB> = {
  [K in $ScalarColumns<Tb>]: object extends $TB[Tb][K] ? K : never
}[$ScalarColumns<Tb>]

type $RelationColumns<
  Tb extends keyof $TB,
  X extends Exclude<keyof $TB[Tb], $ScalarColumns<Tb>>,
  S extends $RelationSign
> = Exclude<keyof $TB[Tb], $ScalarColumns<Tb> | ('M2M' extends S ? never : X)>

type $SimpleScalarAllFilter<T> = {
  eq?: NonNullable<T> | (undefined extends T ? null : never)
  lt?: NonNullable<T> extends boolean | $Enums ? never : NonNullable<T>
  gt?: NonNullable<T> extends boolean | $Enums ? never : NonNullable<T>
  lte?: NonNullable<T> extends boolean | $Enums ? never : NonNullable<T>
  gte?: NonNullable<T> extends boolean | $Enums ? never : NonNullable<T>
  like?: NonNullable<T> extends string ? NonNullable<T> : never
  in?:
    | (NonNullable<T> extends $Enums ? Array<NonNullable<T>> : never)
    | (NonNullable<T> extends boolean ? never : Array<NonNullable<T>>)
  between?: NonNullable<T> extends boolean | $Enums
    ? never
    : [NonNullable<T>, NonNullable<T>?]
  contains?: NonNullable<T> extends string ? NonNullable<T> : never
  startsWith?: NonNullable<T> extends string ? NonNullable<T> : never
  endsWith?: NonNullable<T> extends string ? NonNullable<T> : never
}

// not 适用的字段
type $SimpleScalarNotFilter<T> = {
  not?:
    | $SimpleScalarAllFilter<T>['eq']
    | Pick<
        $SimpleScalarAllFilter<T>,
        | 'eq'
        | (boolean extends T
            ? never
            :
                | 'in'
                | (T extends $Enums
                    ? never
                    :
                        | 'lt'
                        | 'gt'
                        | 'lte'
                        | 'gte'
                        | (string extends T ? 'like' : 'between')))
      >
}

type $SimpleScalarFilter<T> = $SimpleScalarNotFilter<T> &
  $OmitNever<$SimpleScalarAllFilter<T>>

// 用于关系中
type $Where<
  Tb extends keyof $TB,
  X extends keyof $TB[Tb],
  S extends $RelationSign
> = {
  [K in Exclude<keyof $TB[Tb], S extends 'M2M' ? never : X>]?:
    | ($TB[Tb][K] extends $NL[Tb] ? null : never)
    | (K extends $SimpleScalarColumns<Tb>
        ? $TB[Tb][K] | $SimpleScalarFilter<$TB[Tb][K]>
        : NonNullable<$TB[Tb][K]> extends $Relation<infer R, infer R2, infer R3>
        ? 'toOne' extends R3
          ? $Where<R, R2, R3>
          : {
              [K2 in $ToManyFilter]?: $Where<R, R2, R3>
            }
        : never)
} & {
  [L in $WhereLogic]?:
    | $Where<Tb, X, S>[]
    | (L extends 'AND' | 'NOT' ? $Where<Tb, X, S> : never)
}

// 用于关系中
type $Select<
  Tb extends keyof $TB,
  X extends keyof $TB[Tb],
  S extends $RelationSign
> =
${Select('Tb', 'X', 'S')}
type $FindMany<
  Tb extends keyof $TB,
  X extends keyof $TB[Tb],
  S extends $RelationSign
> = {
  where?: $Where<Tb, X, S>
  distinct?: '*' | $Enumerable<$ScalarColumns<Tb>>
  orderBy?: $Enumerable<{ [K in $ScalarColumns<Tb>]?: $Order }>
  limit?: number
  offset?: number
  select?: ${Select('Tb', 'X', 'S')}

}

type $NumberUpdateOperator = {
  increment?: number
  decrement?: number
}

type $Upsert<
  Tb extends keyof $TB,
  X extends keyof $TB[Tb],
  S extends $RelationSign
> = {
  where: $UN[Tb]
  insert: ${Insert('Tb', 'X')}
  update?: ${Update('Tb', 'X', 'S')}
}

type $Update<
  Tb extends keyof $TB,
  X extends keyof $TB[Tb],
  S extends $RelationSign
> = {
  where: $UN[Tb]
  data: ${Update('Tb', 'X', 'S')}
}

type $UpdateToOne<
  RTb extends keyof $TB,
  RX extends keyof $TB[RTb],
  RS extends $RelationSign
> = {
  insert?: ${Insert('RTb', 'RX')}
  update?: Partial<Omit<$TB[RTb], RX | $Auto<RTb>>>
  upsert?: {
    insert: ${Insert('RTb', 'RX')}
    update?: ${Update('RTb', 'RX', 'RS')}
  }
  delete?: true
  connect?: $UN[RTb]
  disconnect?: true
}

type $UpdateToMany<
  RTb extends keyof $TB,
  RX extends keyof $TB[RTb],
  RS extends $RelationSign
> = {
  set?: $Enumerable<
    | Omit<$TB[RTb], RX | $Auto<RTb>>
    | (undefined extends $TB[RTb][RX] ? $UN[RTb] : never)
  >
  insert?: $Enumerable<${Insert('RTb', 'RX')}>
  upsert?: $Enumerable<{
    where: $UN[RTb]
    insert: ${Insert('RTb', 'RX')}
    update?: ${Update('RTb', 'RX', 'RS')}
  }>
  update?: $Enumerable<{
    where: $UN[RTb]
    data: ${Update('RTb', 'RX', 'RS')}
  }>
  updateMany?: $UpdateMany<RTb, RX, RS>
  delete?: $UN[RTb] | $UN[RTb][]
  deleteMany?: $Where<RTb, RX, RS>
  connect?: $UN[RTb] | $UN[RTb][]
  disconnect?: $UN[RTb] | $UN[RTb][]
}

type $UpdateMany<
  Tb extends keyof $TB,
  X extends keyof $TB[Tb],
  S extends $RelationSign
> = {
  where?: $Where<Tb, X, S>
  data: ${UpdateMany('Tb')}
}

export type $TableType<Tb extends keyof $TB> = {
  unique: $UN[Tb]
  where: $Where<Tb, never, never>
  insert: ${Insert('Tb', 'never')}
  update: {
    [K in Exclude<keyof $TB[Tb], $Auto<Tb>>]?: NonNullable<
      $TB[Tb][K]
    > extends $Relation<infer R, infer R2, infer R3>
      ? NonNullable<$TB[Tb][K]> extends $Relation<never, never, never>
        ? $TB[Tb][K]
        : 'toOne' extends R3
        ? Omit<
            $UpdateToOne<R, R2, R3>,
            $TB[Tb][K] extends $NL[Tb] ? never : 'upsert'
          >
        : $UpdateToMany<R, R2, R3>
      : number extends $TB[Tb][K]
      ?
          | $TB[Tb][K]
          | {
              increment?: number
              decrement?: number
            }
      : $TB[Tb][K]
  }
  updateMany: ${UpdateMany('Tb')}
  select: ${Select('Tb', 'never', 'never')}
  selectScalar: Pick<$TableType<Tb>['select'], $ScalarColumns<Tb>>
}

type $TableQuery<Tb extends keyof $TB> = {
  findOne: {
    where: $TableType<Tb>['unique']
    select?: $TableType<Tb>['select']
    sql?: true
  }
  findFirst?: {
    where?: $TableType<Tb>['where']
    select?: $TableType<Tb>['select']
    sql?: true
    orderBy?: $Enumerable<{ [K in $ScalarColumns<Tb>]?: $Order }>
  }
  findMany?: {
    where?: $TableType<Tb>['where']
    select?: $TableType<Tb>['select']
    distinct?: '*' | $Enumerable<$ScalarColumns<Tb>>
    limit?: number
    offset?: number
    sql?: boolean
    orderBy?: $Enumerable<{ [K in $ScalarColumns<Tb>]?: $Order }>
  }
  insert: {
    data: $TableType<Tb>['insert'] | $TableType<Tb>['insert'][]
    select?: $TableType<Tb>['select']
    sql?: true
  }
  upsert: {
    where: $UN[Tb]
    insert: $TableType<Tb>['insert']
    update?: $TableType<Tb>['update']
    select?: $TableType<Tb>['select']
    sql?: true
  }
  update: {
    where: $UN[Tb]
    data: $TableType<Tb>['update']
    select?: $TableType<Tb>['select']
    sql?: true
  }
  updateMany?: {
    where?: $TableType<Tb>['where']
    data: $TableType<Tb>['updateMany']
    select?: $TableType<Tb>['selectScalar']
    sql?: true
  }
  delete: {
    where: $UN[Tb]
    select?: $TableType<Tb>['selectScalar']
    sql?: true
  }
  deleteMany?: {
    where: $TableType<Tb>['where']
    select?: $TableType<Tb>['selectScalar']
    sql?: true
  }
  groupBy?: {
    by: $ScalarColumns<Tb>
    aggregate?: {
      name: string
      column: $ScalarColumns<Tb>
      function: $AggregateQuery
    }[]
    where?: $TableType<Tb>['where']
    having?: $TableType<Tb>['where']
  }
  join?: {
    table: keyof $TB
    method: 'left' | 'right' | 'inner' | 'outer' | 'cross'
    on: {
      columns: $ScalarColumns<Tb>
      tableColumns: $ScalarColumns<Tb>
    }
    select: $TableType<Tb>['select']
    tableSelect: $TableType<Tb>['where']
  }
  aggregate?: {
    select: {
      [K in keyof Required<$TB[Tb]>]?: number extends $TB[Tb][K] ? K : never
    }[keyof $TB[Tb]]
    where?: $TableType<Tb>['where']
    sql?: true
  }
}

type $TableMutationType<
  Tb extends keyof $TB,
  query extends $MutationQuery
> = Omit<$TableQuery<Tb>[query], 'select'> & {
  select?: $TableType<Tb>['selectScalar']
}

type $RelationSelect<
  Tb extends keyof $TB,
  X extends Exclude<keyof $TB[Tb], $ScalarColumns<Tb>>,
  S extends $RelationSign
> = {
  [K in keyof Omit<$TB[Tb], S extends 'M2M' ? never : X>]?: NonNullable<
    $TB[Tb][K]
  > extends $Relation<infer R, infer R2, infer R3>
    ? 'toOne' extends R3
      ? $RelationSelect<R, R2, R3>
      : $RelationSelect<R, R2, R3>[]
    : $TB[Tb][K]
}

export type $ApiBridge =
  | {
      kind: 'rpc'
      method: string[]
      args: any
    }
  | {
      kind: 'orm'
      query: string
      dbVar: string
      method: string[]
      args: any
    }
  | {
      kind: 'raw'
      dbVar: string
      args: any
    }

type $RtnType<Tb extends keyof $TB, isAggregate> = Promise<{
  data?: isAggregate extends true ? number : $RelationSelect<Tb, never, never>
  error?: string
  sql?: string[]
}>

type $RtnArrType<Tb extends keyof $TB, isAggregate> = Promise<{
  data?: isAggregate extends true ? number : $RelationSelect<Tb, never, never>[]
  error?: string
  sql?: string[]
}>
`