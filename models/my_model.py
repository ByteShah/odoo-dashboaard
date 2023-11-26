# -*- coding: utf-8 -*-

from odoo import models, fields

class MyModel(models.Model):
    _name = 'my.model'
    _description = 'My Model Description'

    time = fields.Datetime('Time', required=True)
    field1 = fields.Float('Field 1')
    field2 = fields.Float('Field 2')
