{/* Category Breakdown */}
<Card>
  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
    Por Categoria
  </h2>
  {categoryData.length > 0 ? (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Category Legend */}
      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {categoryData.map((item, index) => {
          const total = categoryData.reduce((sum, d) => sum + d.value, 0)
          const percent = ((item.value / total) * 100).toFixed(1)
          return (
            <div key={index} className="flex items-center justify-between text-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900 dark:text-white">{percent}%</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{formatCurrency(item.value)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  ) : (
    <div className="h-80 flex items-center justify-center text-gray-500">
      Nenhuma despesa este mês
    </div>
  )}
</Card>
