{% macro get_comparator_value(comparator) %}
    {% set value %}
        {%- if comparator == "equal" -%}
            =
        {%- elif comparator == "less" -%}
            <
        {%- elif comparator == "greater" -%}
            >
        {%- elif comparator == "less_or_equal" -%}
            <=
        {%- elif comparator == "greater_or_equal" -%}
            >=
        {%- else -%}
        {%- endif -%}
    {% endset %}

    {% if execute %}
        {% do return(value) %}
    {% endif %}
{% endmacro %}


{% macro compare_with_number(dbt_model, column, comparator, comparison_value) %}
    {% set comparator_value = get_comparator_value(comparator) %}

    {% set query %}
        SELECT *
        FROM {{ ref(dbt_model) }}
        WHERE {{ column }} {{ comparator_value }} {{ comparison_value }}
    {% endset %}

    {% if execute %}
        {{ log(query, info=True) }}
        {% do return(query) %}
    {% endif %}
{% endmacro %}